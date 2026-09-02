"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  bio: z.string().optional(),
  timeZone: z.string().default("UTC"),
});

export async function updateUserProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const validated = profileSchema.parse(data);

  // Check if username is taken by another user
  const cleanUsername = validated.username
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");

  const existing = await prisma.user.findFirst({
    where: {
      username: cleanUsername,
      NOT: { id: session.user.id },
    },
  });

  if (existing) {
    throw new Error("Este nombre de usuario ya está en uso. Por favor, elige otro.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: validated.name,
      username: cleanUsername,
      bio: validated.bio,
      timeZone: validated.timeZone,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
