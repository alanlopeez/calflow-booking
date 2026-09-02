import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <SettingsForm
      initialData={{
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio,
        timeZone: user.timeZone || "America/Mexico_City",
        image: user.image,
      }}
    />
  );
}
