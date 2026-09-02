"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventTypeSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  duration: z.number().min(5).max(720),
  bufferBefore: z.number().min(0).max(120).default(0),
  bufferAfter: z.number().min(0).max(120).default(0),
  color: z.string().default("#0f172a"),
  price: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  locations: z.string().default('[{"type":"google_meet"}]'),
  customInputs: z.string().optional(),
});

export async function createEventType(formData: z.infer<typeof eventTypeSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const validated = eventTypeSchema.parse(formData);

  // Generate unique slug for user if taken
  let slug = validated.slug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let uniqueSlug = slug;
  let count = 1;
  while (
    await prisma.eventType.findUnique({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug: uniqueSlug,
        },
      },
    })
  ) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  const created = await prisma.eventType.create({
    data: {
      userId: session.user.id,
      title: validated.title,
      slug: uniqueSlug,
      description: validated.description,
      duration: validated.duration,
      bufferBefore: validated.bufferBefore,
      bufferAfter: validated.bufferAfter,
      color: validated.color,
      price: validated.price,
      currency: validated.currency,
      locations: validated.locations,
      customInputs: validated.customInputs,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/event-types");
  return { success: true, eventType: created };
}

export async function updateEventType(id: string, formData: Partial<z.infer<typeof eventTypeSchema>>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const existing = await prisma.eventType.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Tipo de evento no encontrado");
  }

  const updated = await prisma.eventType.update({
    where: { id },
    data: {
      ...formData,
    },
  });

  revalidatePath("/dashboard/event-types");
  return { success: true, eventType: updated };
}

export async function toggleEventTypeActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  await prisma.eventType.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive },
  });

  revalidatePath("/dashboard/event-types");
  return { success: true };
}

export async function deleteEventType(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  await prisma.eventType.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard/event-types");
  return { success: true };
}
