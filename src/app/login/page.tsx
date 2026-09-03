import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] text-center space-y-6">
          {/* Brand Icon */}
          <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md">
            <Calendar className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Bienvenido a CalFlow
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Conecta tu Google Calendar para comenzar a recibir reservas automáticamente.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Sincronización bidireccional en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Generación automática de salas de Google Meet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Cero colisiones de horario y doble agendamiento</span>
            </div>
          </div>

          {/* Google Sign In Action */}
          <GoogleSignInButton />

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Al continuar, aceptas nuestras{" "}
            <Link href="/terms" className="text-slate-600 hover:underline font-medium">
              Condiciones del Servicio
            </Link>{" "}
            y nuestras{" "}
            <Link href="/privacy" className="text-slate-600 hover:underline font-medium">
              Políticas de Privacidad
            </Link>
            , autorizando la sincronización de calendario para calcular disponibilidad y crear reuniones en tu nombre.
          </p>
        </div>
      </div>
    </div>
  );
}
