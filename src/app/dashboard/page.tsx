import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Clock,
  Video,
  Copy,
  Plus,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  CalendarDays,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      eventTypes: true,
      bookings: {
        include: { eventType: true },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!user) return null;

  const now = new Date();
  const upcomingBookings = user.bookings.filter(
    (b) => new Date(b.startTime) >= now && b.status === "CONFIRMED"
  );
  const pastBookings = user.bookings.filter(
    (b) => new Date(b.startTime) < now || b.status === "CANCELLED"
  );

  const totalMinutesUpcoming = upcomingBookings.reduce(
    (acc, b) => acc + (b.eventType?.duration || 30),
    0
  );
  const totalHoursUpcoming = (totalMinutesUpcoming / 60).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            ¡Hola, {user.name?.split(" ")[0] || "Usuario"}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aquí tienes el resumen de tu agenda y próximas reuniones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${user.username}`} target="_blank">
            <Button variant="outline" className="rounded-2xl gap-2 font-semibold">
              <span>Ver mi Página Pública</span>
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </Button>
          </Link>
          <Link href="/dashboard/event-types">
            <Button variant="default" className="rounded-2xl gap-2 font-semibold shadow-md">
              <Plus className="h-4 w-4" />
              <span>Nuevo Evento</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid inspired by reference screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <Badge variant="pillSoft">Activos</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-950">
            {user.eventTypes.filter((e) => e.isActive).length}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Tipos de Reunión</p>
        </Card>

        {/* Stat 2 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <Badge variant="success">Confirmadas</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-950">
            {upcomingBookings.length}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Próximas Reuniones</p>
        </Card>

        {/* Stat 3 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <Badge variant="pillSoft">Estimado</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-950">
            {totalHoursUpcoming}h
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Horas Agendadas</p>
        </Card>

        {/* Stat 4 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Video className="h-5 w-5" />
            </div>
            <Badge variant="success">Google Meet</Badge>
          </div>
          <p className="text-3xl font-extrabold text-slate-950">100%</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">Sincronización Automática</p>
        </Card>
      </div>

      {/* Main Grid: Upcoming Bookings & Event Types */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming Bookings List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Próximas Citas</h2>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No tienes reuniones próximas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Comparte tu enlace de reserva en tus redes o correo para que otros puedan agendar contigo.
              </p>
              <Link href={`/${user.username}`} target="_blank">
                <Button variant="outline" size="sm" className="rounded-xl mt-2">
                  Ver mi enlace de reserva
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <Card key={booking.id} className="p-4 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {format(new Date(booking.startTime), "dd MMM", { locale: es })}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {booking.eventType?.title || "Reunión"}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{booking.guestName} ({booking.guestEmail})</span>
                          <span>•</span>
                          <span>{format(new Date(booking.startTime), "hh:mm a")}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {booking.meetLink ? (
                        <a
                          href={booking.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="default" className="rounded-xl text-xs gap-1.5 bg-blue-600 hover:bg-blue-700">
                            <Video className="h-3.5 w-3.5" />
                            <span>Unirse a Meet</span>
                          </Button>
                        </a>
                      ) : (
                        <Badge variant="secondary">Confirmada</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Event Types Shortcuts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Tus Tipos de Reunión</h2>
            <Link
              href="/dashboard/event-types"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Gestionar</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {user.eventTypes.slice(0, 3).map((event) => (
              <Card key={event.id} className="p-4 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{event.duration} min</span>
                      <span>•</span>
                      <span>Google Meet</span>
                    </p>
                  </div>

                  <Link href={`/${user.username}/${event.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-slate-900">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
