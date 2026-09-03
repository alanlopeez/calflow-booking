import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL es requerida"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID es requerida"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET es requerida"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres por seguridad"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL debe ser una URL válida").optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL debe ser una URL válida").optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Error crítico en variables de entorno:", parsed.error.format());
    throw new Error("Configuración de variables de entorno inválida o insegura.");
  }
  return parsed.data;
}

export const env = validateEnv();
