import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Layers,
  Clock,
  Code2,
  Settings,
  LogOut,
  ExternalLink,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        where: { provider: "google" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const hasGoogleCalendar = user.accounts.length > 0 && !!user.accounts[0].refresh_token;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between p-6 shrink-0 hidden md:flex sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              CalFlow<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <CalendarCheck className="h-4 w-4 text-slate-500" />
              <span>Resumen</span>
            </Link>

            <Link
              href="/dashboard/event-types"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <Layers className="h-4 w-4 text-slate-500" />
              <span>Tipos de Eventos</span>
            </Link>

            <Link
              href="/dashboard/availability"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Disponibilidad</span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Mis Reservas</span>
            </Link>

            <Link
              href="/dashboard/embed"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <Code2 className="h-4 w-4 text-slate-500" />
              <span>Incrustar Widget</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-all"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Ajustes</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Profile & Google Calendar Status */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          {/* Calendar Status Card */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${hasGoogleCalendar ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-xs font-semibold text-slate-700">Google Calendar</span>
            </div>
            <Badge variant={hasGoogleCalendar ? "success" : "warning"} className="text-[10px] px-2 py-0.5">
              {hasGoogleCalendar ? "Activo" : "Reconectar"}
            </Badge>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Usuario"}
                  width={36}
                  height={36}
                  className="rounded-full border border-slate-200"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {user.name?.[0] || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name || "Usuario"}</p>
                <Link
                  href={`/${user.username}`}
                  target="_blank"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 truncate"
                >
                  <span>/{user.username}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                title="Cerrar sesión"
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-slate-200 bg-white p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-950 flex items-center justify-center text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-950">CalFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/${user.username}`} target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                <span>Mi Enlace</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
