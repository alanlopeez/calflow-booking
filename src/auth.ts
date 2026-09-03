import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      if (token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { id: true, username: true, timeZone: true, name: true, email: true, image: true },
        });

        if (dbUser) {
          // If user does not have a username, generate one
          if (!dbUser.username && (dbUser.email || dbUser.name)) {
            const baseSlug = (dbUser.name || dbUser.email?.split("@")[0] || "user")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "");
            
            let finalSlug = baseSlug;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username: finalSlug } })) {
              finalSlug = `${baseSlug}-${counter}`;
              counter++;
            }

            await prisma.user.update({
              where: { id: dbUser.id },
              data: { username: finalSlug },
            });

            // Create default schedule and default event types if not present
            const existingSchedule = await prisma.schedule.findFirst({
              where: { userId: dbUser.id },
            });

            if (!existingSchedule) {
              const schedule = await prisma.schedule.create({
                data: {
                  userId: dbUser.id,
                  name: "Horario Laboral",
                  isDefault: true,
                  timeZone: "America/Mexico_City",
                },
              });

              await prisma.availability.create({
                data: {
                  scheduleId: schedule.id,
                  days: JSON.stringify([1, 2, 3, 4, 5]), // Mon-Fri
                  startTime: "09:00",
                  endTime: "17:00",
                },
              });
            }

            const existingEvents = await prisma.eventType.findFirst({
              where: { userId: dbUser.id },
            });

            if (!existingEvents) {
              await prisma.eventType.createMany({
                data: [
                  {
                    userId: dbUser.id,
                    title: "Reunión Rápida de 15 Min",
                    slug: "15-min",
                    description: "Reunión breve de sincronización y alineamiento rápido.",
                    duration: 15,
                    isActive: true,
                    bufferBefore: 5,
                    bufferAfter: 5,
                    color: "#3b82f6",
                    locations: JSON.stringify([{ type: "google_meet" }]),
                  },
                  {
                    userId: dbUser.id,
                    title: "Sesión de Estrategia (30 Min)",
                    slug: "30-min",
                    description: "Llamada de estrategia o demostración de producto.",
                    duration: 30,
                    isActive: true,
                    bufferBefore: 10,
                    bufferAfter: 10,
                    color: "#0f172a",
                    locations: JSON.stringify([{ type: "google_meet" }]),
                  },
                  {
                    userId: dbUser.id,
                    title: "Consultoría Profunda (60 Min)",
                    slug: "60-min",
                    description: "Sesión completa de consultoría y diseño de soluciones.",
                    duration: 60,
                    isActive: true,
                    bufferBefore: 15,
                    bufferAfter: 15,
                    color: "#8b5cf6",
                    locations: JSON.stringify([{ type: "google_meet" }]),
                  },
                ],
              });
            }

            token.username = finalSlug;
          } else {
            token.username = dbUser.username;
          }

          token.timeZone = dbUser.timeZone;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
        session.user.timeZone = (token.timeZone as string) || "UTC";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: env.AUTH_SECRET,
});
