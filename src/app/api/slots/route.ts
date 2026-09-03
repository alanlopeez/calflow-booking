import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const slotsQuerySchema = z.object({
  userId: z.string().min(1),
  eventTypeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  timezone: z.string().max(100).default("UTC"),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Anti-scraping / Anti-DoS)
    const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateCheck = rateLimit(`slots:${ip}`, { limit: 60, windowSeconds: 60 });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Por favor, intente más tarde." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const parseResult = slotsQuerySchema.safeParse({
      userId: searchParams.get("userId"),
      eventTypeId: searchParams.get("eventTypeId"),
      date: searchParams.get("date"),
      timezone: searchParams.get("timezone") || "UTC",
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, eventTypeId, date, timezone } = parseResult.data;

    const slots = await getAvailableSlots({
      userId,
      eventTypeId,
      dateStr: date,
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
