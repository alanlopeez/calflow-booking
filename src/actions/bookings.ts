"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookingSchema = z.object({
  eventTypeId: z.string(),
  startTime: z.string(), // ISO string UTC
  endTime: z.string(),   // ISO string UTC
  guestName: z.string().min(2, "El nombre es obligatorio"),
  guestEmail: z.string().email("Correo electrónico inválido"),
  guestNotes: z.string().optional(),
  guestTimezone: z.string().default("UTC"),
  customResponses: z.string().optional(), // JSON
});

export async function createPublicBooking(data: z.infer<typeof bookingSchema>) {
  const validated = bookingSchema.parse(data);

  // 1. Fetch EventType & User
  const eventType = await prisma.eventType.findUnique({
    where: { id: validated.eventTypeId },
    include: { user: true },
  });

  if (!eventType || !eventType.isActive) {
    throw new Error("El tipo de evento no está disponible.");
  }

  const hostUser = eventType.user;
  const startDate = new Date(validated.startTime);
  const endDate = new Date(validated.endTime);

  // 2. Check if already booked
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

  // 3. Create Google Calendar Event with Google Meet
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

  // 4. Save Booking to Database
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

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
  });

  if (!booking) {
    throw new Error("Reserva no encontrada");
  }

  // Delete from Google Calendar if event id exists
  if (booking.googleEventId) {
    await deleteGoogleCalendarEvent(session.user.id, booking.googleEventId);
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason || "Cancelada por el anfitrión",
    },
  });

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
