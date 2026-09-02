import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { EmbedBuilder } from "@/components/dashboard/embed-builder";
import { redirect } from "next/navigation";

export default async function EmbedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      eventTypes: {
        where: { isActive: true },
        select: { id: true, title: true, slug: true },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <EmbedBuilder
      username={user.username || "usuario"}
      eventTypes={user.eventTypes}
    />
  );
}
