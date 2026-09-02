import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EventTypesManager } from "@/components/dashboard/event-types-manager";
import { redirect } from "next/navigation";

export default async function EventTypesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      eventTypes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <EventTypesManager
      initialEventTypes={user.eventTypes}
      username={user.username || "usuario"}
    />
  );
}
