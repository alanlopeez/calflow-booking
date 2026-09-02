import Link from "next/link";
import { auth } from "@/auth";
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Globe2,
  Code2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              CalFlow<span className="text-blue-600">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition-colors">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">
              Cómo Funciona
            </a>
            <a href="#integrations" className="hover:text-slate-950 transition-colors">
              Google Calendar
            </a>
            <a href="#embed" className="hover:text-slate-950 transition-colors">
              Incrustar Widget
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link href="/dashboard">
                <Button variant="default" size="pill" className="gap-2">
                  <span>Ir al Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-slate-700">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="default" size="pill" className="gap-2 shadow-md">
                    <span>Empezar Gratis</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización instantánea con Google Calendar & Meet
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              Agendamiento <span className="underline decoration-blue-500/30 underline-offset-8">inteligente</span> para profesionales y equipos
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Elimina los correos de ida y vuelta para coordinar reuniones. Comparte tu enlace personalizado, sincroniza tu disponibilidad en tiempo real y genera salas de Google Meet de manera automática.
            </p>

            {/* Pill Search / Instant booking bar inspired by design references */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col sm:flex-row items-center gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tu Enlace</p>
                  <p className="text-sm font-bold text-slate-800 truncate">calflow.io/tu-nombre</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />

              <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Video className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lugar</p>
                  <p className="text-sm font-bold text-slate-800">Google Meet</p>
                </div>
              </div>

              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="default" size="lg" className="w-full sm:w-auto rounded-2xl gap-2 font-semibold">
                  <span>Crear Enlace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-4 flex flex-wrap items-center gap-8 border-t border-slate-200/70">
              <div>
                <p className="text-3xl font-extrabold text-slate-950">50K+</p>
                <p className="text-xs font-medium text-slate-500">Reuniones Agendadas</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-extrabold text-slate-950">20K+</p>
                <p className="text-xs font-medium text-slate-500">Usuarios Conectados</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-extrabold text-slate-950">99.9%</p>
                <p className="text-xs font-medium text-slate-500">Precisión de Calendario</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Visual Mockup inspired by reference screens */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl bg-slate-950 p-6 text-white shadow-2xl border border-slate-800">
              {/* Top Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white">
                    CF
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Carlos Méndez</h3>
                    <p className="text-xs text-slate-400">@carlos · Product Lead</p>
                  </div>
                </div>
                <Badge variant="pillSoft" className="bg-slate-800 text-emerald-400 border border-emerald-500/20">
                  En línea
                </Badge>
              </div>

              {/* Event types cards in dark mockup */}
              <div className="mt-6 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-semibold">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        Reunión Rápida de 15m
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Video className="h-3.5 w-3.5 text-slate-500" /> Google Meet
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-semibold">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        Sesión de Estrategia (30m)
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Video className="h-3.5 w-3.5 text-slate-500" /> Google Meet
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-semibold">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        Consultoría Completa (60m)
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Video className="h-3.5 w-3.5 text-slate-500" /> Google Meet
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Floating notification badge */}
              <div className="mt-6 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Reunión confirmada para mañana 10:00 AM · Google Meet generado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="pillSoft" className="mb-4">
              Características Avanzadas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
              Diseñado para optimizar tu tiempo al máximo
            </h2>
            <p className="text-slate-600 mt-4 text-base sm:text-lg">
              Todo lo que necesitas para gestionar tu agenda profesional sin fricciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Sincronización en Tiempo Real
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Consulta directa con Google Calendar freebusy para evitar colisiones y doble reserva en todo momento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Google Meet Automático
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cada reserva confirmada genera un enlace nativo de Google Meet y envía invitaciones a ambas partes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Detección de Zonas Horarias
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Convierte los horarios automáticamente a la zona horaria de tus clientes en cualquier parte del mundo.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Intervalos de Tiempo y Descanso
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Configura intervalos de tiempo antes y después de cada reunión para evitar el agotamiento.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Incrustable en Cualquier Web
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generador de código listo para copiar (botón flotante, popup o iframe inline) para tu web o landing page.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="h-12 w-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">
                Seguridad y Privacidad Blindada
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tokens cifrados y persistencia segura en Neon PostgreSQL con arquitectura serverless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-950 text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Comienza a recibir reservas hoy mismo
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Conecta tu cuenta de Google en un solo clic y comparte tu enlace personalizado en segundos.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button variant="default" size="lg" className="bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-base px-8 py-6 shadow-lg">
                  Iniciar con Google
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-950 flex items-center justify-center text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-950">CalFlow</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Políticas de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Condiciones del Servicio
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CalFlow SaaS. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
