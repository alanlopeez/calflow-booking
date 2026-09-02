import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";
import { redirect } from "next/navigation";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let schedule = await prisma.schedule.findFirst({
    where: { userId: session.user.id, isDefault: true },
    include: {
      availability: true,
      dateOverrides: true,
    },
  });

  if (!schedule) {
    schedule = await prisma.schedule.create({
      data: {
        userId: session.user.id,
        name: "Horario Principal",
        isDefault: true,
        timeZone: "America/Mexico_City",
      },
      include: {
        availability: true,
        dateOverrides: true,
      },
    });

    await prisma.availability.create({
      data: {
        scheduleId: schedule.id,
        days: JSON.stringify([1, 2, 3, 4, 5]),
        startTime: "09:00",
        endTime: "17:00",
      },
    });

    schedule = (await prisma.schedule.findUnique({
      where: { id: schedule.id },
      include: {
        availability: true,
        dateOverrides: true,
      },
    }))!;
  }

  return <AvailabilityManager schedule={schedule} />;
}
