import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const eventTypeId = searchParams.get("eventTypeId");
    const dateStr = searchParams.get("date"); // "YYYY-MM-DD"
    const timezone = searchParams.get("timezone") || "UTC";

    if (!userId || !eventTypeId || !dateStr) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: userId, eventTypeId, date" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots({
      userId,
      eventTypeId,
      dateStr,
      guestTimezone: timezone,
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error al obtener slots:", error);
    return NextResponse.json(
      { error: "Error al calcular horarios disponibles" },
      { status: 500 }
    );
  }
}
