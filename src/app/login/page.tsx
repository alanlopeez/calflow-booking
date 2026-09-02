import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 bg-slate-950 text-white hover:bg-black font-bold shadow-md active:scale-[0.98] transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.94.55 4.04 1.45l3.03-3.03C17.2 1.7 14.77 1 12 1 7.37 1 3.44 3.78 1.63 7.78l3.66 2.84C6.18 7.35 8.84 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.96 3.71-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.62c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.63 7.22C.59 9.3.01 11.6.01 14s.58 4.7 1.62 6.78l3.66-2.84z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.08.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.62L1.63 15.6C3.44 19.6 7.37 23 12 23z"
                />
              </svg>
              <span>Continuar con Google</span>
            </Button>
          </form>

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
