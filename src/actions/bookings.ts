"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookingSchema = z.object({
  eventTypeId: z.string().min(1),
  startTime: z.string().datetime({ message: "Fecha de inicio inválida" }),
  endTime: z.string().datetime({ message: "Fecha de fin inválida" }),
  guestName: z.string().trim().min(2, "El nombre es obligatorio").max(100, "Nombre demasiado largo"),
  guestEmail: z.string().trim().email("Correo electrónico inválido").max(255),
  guestNotes: z.string().trim().max(1000, "Las notas no pueden superar 1000 caracteres").optional(),
  guestTimezone: z.string().max(100).default("UTC"),
  customResponses: z.string().max(2000).optional(),
});

export async function createPublicBooking(data: z.infer<typeof bookingSchema>) {
  // 1. Rate Limiting Protection (Anti-DoS / Anti-spam for Google Calendar API)
  const clientIp = getClientIp();
  const rateLimitStatus = rateLimit(`booking:${clientIp}`, {
    limit: 5,
    windowSeconds: 600, // 5 bookings per 10 minutes per IP
  });

  if (!rateLimitStatus.success) {
    throw new Error(
      "Has superado el límite de reservas consecutivas. Por favor, espera 10 minutos antes de intentar nuevamente."
    );
  }

  // 2. Strict Input Validation
  const validated = bookingSchema.parse(data);
  const startDate = new Date(validated.startTime);
  const endDate = new Date(validated.endTime);

  if (endDate <= startDate) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
  }

  // Ensure appointment is not in the deep past
  const minimumAllowedTime = new Date(Date.now() - 5 * 60 * 1000);
  if (startDate < minimumAllowedTime) {
    throw new Error("No es posible reservar un horario en el pasado.");
  }

  // 3. Fetch EventType & Host User
  const eventType = await prisma.eventType.findUnique({
    where: { id: validated.eventTypeId },
    include: { user: true },
  });

  if (!eventType || !eventType.isActive) {
    throw new Error("El tipo de evento no está disponible.");
  }

  const hostUser = eventType.user;

  // 4. Double-check overlap in Database to prevent Race Conditions
  const existing = await prisma.booking.findFirst({
    where: {
      userId: hostUser.id,
      status: "CONFIRMED",
      OR: [
        {
          startTime: { lte: startDate },
          endTime: { gt: startDate },
        },
        {
          startTime: { lt: endDate },
          endTime: { gte: endDate },
        },
      ],
    },
  });

  if (existing) {
    throw new Error("Este horario acaba de ser reservado. Por favor, selecciona otro horario.");
  }

  // 5. Create Google Calendar Event with Google Meet link
  const eventSummary = `${eventType.title}: ${validated.guestName} y ${hostUser.name || "Anfitrión"}`;
  const eventDescription = [
    `Reserva: ${eventType.title}`,
    `Invitado: ${validated.guestName} (${validated.guestEmail})`,
    validated.guestNotes ? `Notas: ${validated.guestNotes}` : "",
    `Duración: ${eventType.duration} minutos`,
  ]
    .filter(Boolean)
    .join("\n");

  const { googleEventId, meetLink } = await createGoogleCalendarEvent({
    userId: hostUser.id,
    summary: eventSummary,
    description: eventDescription,
    startTime: startDate,
    endTime: endDate,
    timeZone: hostUser.timeZone || "UTC",
    guestEmail: validated.guestEmail,
    guestName: validated.guestName,
  });

  // 6. Save Booking to Database
  const booking = await prisma.booking.create({
    data: {
      eventTypeId: eventType.id,
      userId: hostUser.id,
      guestName: validated.guestName,
      guestEmail: validated.guestEmail,
      guestNotes: validated.guestNotes,
      guestTimezone: validated.guestTimezone,
      customResponses: validated.customResponses,
      startTime: startDate,
      endTime: endDate,
      status: "CONFIRMED",
      meetLink: meetLink || null,
      googleEventId: googleEventId || null,
    },
    include: {
      eventType: true,
      user: true,
    },
  });

  return {
    success: true,
    booking: {
      id: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      meetLink: booking.meetLink,
      eventType: {
        title: booking.eventType.title,
        duration: booking.eventType.duration,
        color: booking.eventType.color,
      },
      host: {
        name: booking.user.name,
        email: booking.user.email,
        image: booking.user.image,
      },
    },
  };
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  // Security Check: Verify host ownership of booking before cancellation (IDOR prevention)
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
  });

  if (!booking) {
    throw new Error("Reserva no encontrada o no autorizada");
  }

  const cleanReason = (reason || "Cancelada por el anfitrión").substring(0, 500);

  // Delete from Google Calendar if event id exists
  if (booking.googleEventId) {
    await deleteGoogleCalendarEvent(session.user.id, booking.googleEventId);
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationReason: cleanReason,
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
