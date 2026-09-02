"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface SaveScheduleData {
  scheduleId: string;
  timeZone: string;
  availability: {
    days: number[];
    startTime: string;
    endTime: string;
  }[];
}

export async function saveUserSchedule(data: SaveScheduleData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  // Update schedule timezone
  await prisma.schedule.update({
    where: { id: data.scheduleId },
    data: { timeZone: data.timeZone },
  });

  // Update user default timezone as well
  await prisma.user.update({
    where: { id: session.user.id },
    data: { timeZone: data.timeZone },
  });

  // Delete existing availability for schedule
  await prisma.availability.deleteMany({
    where: { scheduleId: data.scheduleId },
  });

  // Insert new availability items
  for (const item of data.availability) {
    if (item.days.length > 0) {
      await prisma.availability.create({
        data: {
          scheduleId: data.scheduleId,
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

export async function addDateOverride(scheduleId: string, override: {
  date: string; // "YYYY-MM-DD"
  isUnavailable: boolean;
  startTime?: string;
  endTime?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const [year, month, day] = override.date.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  await prisma.dateOverride.create({
    data: {
      scheduleId,
      date: targetDate,
      isUnavailable: override.isUnavailable,
      startTime: override.startTime || null,
      endTime: override.endTime || null,
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

  await prisma.dateOverride.delete({
    where: { id: overrideId },
  });

  revalidatePath("/dashboard/availability");
  return { success: true };
}
