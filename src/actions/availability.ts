"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const saveScheduleSchema = z.object({
  scheduleId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  availability: z.array(
    z.object({
      days: z.array(z.number().int().min(0).max(6)),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
    })
  ),
});

export type SaveScheduleData = z.infer<typeof saveScheduleSchema>;

export async function saveUserSchedule(data: SaveScheduleData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const validated = saveScheduleSchema.parse(data);

  // Security Check: Verify that the schedule strictly belongs to the authenticated user (IDOR prevention)
  const userSchedule = await prisma.schedule.findFirst({
    where: {
      id: validated.scheduleId,
      userId: session.user.id,
    },
  });

  if (!userSchedule) {
    throw new Error("Horario no encontrado o acceso no autorizado.");
  }

  // Update schedule timezone
  await prisma.schedule.update({
    where: { id: userSchedule.id },
    data: { timeZone: validated.timeZone },
  });

  // Update user default timezone as well
  await prisma.user.update({
    where: { id: session.user.id },
    data: { timeZone: validated.timeZone },
  });

  // Delete existing availability for verified schedule
  await prisma.availability.deleteMany({
    where: { scheduleId: userSchedule.id },
  });

  // Insert new availability items
  for (const item of validated.availability) {
    if (item.days.length > 0) {
      await prisma.availability.create({
        data: {
          scheduleId: userSchedule.id,
          days: JSON.stringify(item.days),
          startTime: item.startTime,
          endTime: item.endTime,
        },
      });
    }
  }

  revalidatePath("/dashboard/availability");
  return { success: true };
}

const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  isUnavailable: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});

export async function addDateOverride(
  scheduleId: string,
  override: z.infer<typeof dateOverrideSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  // Security Check: Verify schedule ownership (IDOR prevention)
  const userSchedule = await prisma.schedule.findFirst({
    where: {
      id: scheduleId,
      userId: session.user.id,
    },
  });

  if (!userSchedule) {
    throw new Error("Horario no encontrado o acceso no autorizado.");
  }

  const validated = dateOverrideSchema.parse(override);

  const [year, month, day] = validated.date.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  await prisma.dateOverride.create({
    data: {
      scheduleId: userSchedule.id,
      date: targetDate,
      isUnavailable: validated.isUnavailable,
      startTime: validated.startTime || null,
      endTime: validated.endTime || null,
    },
  });

  revalidatePath("/dashboard/availability");
  return { success: true };
}

export async function deleteDateOverride(overrideId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  // Security Check: Verify ownership through schedule relationship before deleting (IDOR prevention)
  const override = await prisma.dateOverride.findUnique({
    where: { id: overrideId },
    include: { schedule: true },
  });

  if (!override || override.schedule.userId !== session.user.id) {
    throw new Error("Excepción de horario no encontrada o acceso no autorizado.");
  }

  await prisma.dateOverride.delete({
    where: { id: overrideId },
  });

  revalidatePath("/dashboard/availability");
  return { success: true };
}
