import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateIcsFile } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Falta bookingId" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventType: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const icsContent = generateIcsFile({
      title: `${booking.eventType.title} - ${booking.guestName}`,
      description: `Reunión agendada con ${booking.user.name || "Anfitrión"}.\nEnlace de Meet: ${booking.meetLink || "Por definir"}\nNotas: ${booking.guestNotes || "Sin notas"}`,
      location: booking.meetLink || "Google Meet",
      startTime: booking.startTime,
      endTime: booking.endTime,
      organizerName: booking.user.name || "Anfitrión",
      organizerEmail: booking.user.email || undefined,
    });

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="reunion-${booking.id}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating ICS:", error);
    return NextResponse.json({ error: "Error al generar archivo de calendario" }, { status: 500 });
  }
}
