"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventTypeSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100, "El título es demasiado largo"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").max(60, "El slug es demasiado largo"),
  description: z.string().max(1000, "La descripción es demasiado larga").optional(),
  duration: z.number().int().min(5).max(720),
  bufferBefore: z.number().int().min(0).max(120).default(0),
  bufferAfter: z.number().int().min(0).max(120).default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido").default("#0f172a"),
  price: z.number().min(0).default(0),
  currency: z.string().length(3).default("USD"),
  locations: z.string().max(1000).default('[{"type":"google_meet"}]'),
  customInputs: z.string().max(5000).optional(),
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

  // Security Check: Verify ownership (IDOR prevention)
  const existing = await prisma.eventType.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Tipo de evento no encontrado o no autorizado");
  }

  const validated = eventTypeSchema.partial().parse(formData);

  let slugToUpdate = validated.slug;
  if (slugToUpdate) {
    slugToUpdate = slugToUpdate
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const updated = await prisma.eventType.update({
    where: { id: existing.id },
    data: {
      ...validated,
      ...(slugToUpdate ? { slug: slugToUpdate } : {}),
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
