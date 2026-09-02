import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BookingsManager } from "@/components/dashboard/bookings-manager";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      eventType: {
        select: {
          title: true,
          duration: true,
          color: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return <BookingsManager bookings={bookings} />;
}
