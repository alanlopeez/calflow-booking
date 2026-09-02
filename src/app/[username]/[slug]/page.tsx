import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicBookingFlow } from "@/components/booking/public-booking-flow";

export default async function BookingPage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });

  if (!user) {
    notFound();
  }

  const eventType = await prisma.eventType.findUnique({
    where: {
      userId_slug: {
        userId: user.id,
        slug: params.slug,
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    notFound();
  }

  return (
    <PublicBookingFlow
      host={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
        bio: user.bio,
        timeZone: user.timeZone || "UTC",
      }}
      eventType={{
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        description: eventType.description,
        duration: eventType.duration,
        color: eventType.color,
      }}
    />
  );
}
