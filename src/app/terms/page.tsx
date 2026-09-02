import Link from "next/link";
import { Calendar, ArrowLeft, FileText, CheckCircle, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Condiciones del Servicio | CalFlow",
  description: "Términos y condiciones de uso del servicio de reservas y agendamiento de CalFlow.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-950">
              CalFlow<span className="text-blue-600">.</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs font-semibold text-slate-600">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver al inicio</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-10">
          {/* Header */}
          <div className="border-b border-slate-100 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-4">
              <Scale className="h-3.5 w-3.5" />
              <span>Términos Legales</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Condiciones del Servicio de la Aplicación
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Última actualización: Septiembre de 2026
            </p>
          </div>

          {/* Intro */}
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed">
            <p>
              Bienvenido a <strong>CalFlow</strong>. Al acceder a nuestra plataforma, registrarte con tu cuenta o utilizar nuestras herramientas de programación y reservas de citas, aceptas estar legalmente sujeto a estas Condiciones del Servicio. Si no estás de acuerdo con alguno de estos términos, debes abstenerte de utilizar la plataforma.
            </p>
          </div>

          {/* Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Uso Responsable</h4>
              <p className="text-xs text-slate-500">Debes proporcionar información veraz al agendar o crear citas.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Integración con Google</h4>
              <p className="text-xs text-slate-500">Autorizas la creación de eventos y salas de Google Meet en tu nombre.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Disponibilidad</h4>
              <p className="text-xs text-slate-500">El servicio se ofrece con altos estándares de operatividad continua.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                1. Descripción del Servicio
              </h2>
              <p>
                CalFlow es una solución de software como servicio (SaaS) que permite a profesionales, empresas e individuos automatizar la gestión de reservas de reuniones, conectando calendarios personales o corporativos de Google para publicar enlaces de disponibilidad y generar salas de videoconferencia (Google Meet).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                2. Registro y Cuentas de Usuario
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Para utilizar las funciones de anfitrión, debes autenticarte mediante una cuenta válida de Google a través del protocolo OAuth 2.0.</li>
                <li>Eres responsable de mantener la seguridad y confidencialidad de tu cuenta y de las acciones realizadas a través de ella.</li>
                <li>Nos reservamos el derecho de suspender cuentas que utilicen el servicio para enviar spam, realizar fraudes o infringir derechos de terceros.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                3. Conexión con Servicios de Google
              </h2>
              <p>
                Al autorizar la conexión con tu cuenta de Google, otorgas permiso a CalFlow para:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Consultar los horarios en los que tu calendario principal se encuentra ocupado.</li>
                <li>Insertar eventos con fecha, hora, asistentes y enlace a Google Meet cuando un invitado reserve una sesión a través de tu enlace público.</li>
                <li>Actualizar o eliminar dichos eventos en caso de cancelación o reprogramación dentro de la plataforma.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                4. Conducta de los Usuarios e Invitados
              </h2>
              <p>
                Tanto los anfitriones como los invitados que agendan reuniones se comprometen a:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>No utilizar la plataforma para distribuir contenido malicioso, virus informáticos o mensajes no solicitados (spam).</li>
                <li>No realizar reservas falsas, abusivas o fraudulentas en páginas de reservas de otros usuarios.</li>
                <li>Respetar las zonas horarias y los horarios pactados en las confirmaciones emitidas.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                5. Propiedad Intelectual
              </h2>
              <p>
                Todos los derechos de propiedad intelectual sobre el diseño, software, logotipos, marcas, código fuente y contenidos de CalFlow son propiedad exclusiva de CalFlow o sus licenciantes. Queda prohibida la reproducción, descompilación o ingeniería inversa no autorizada.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                6. Limitación de Responsabilidad
              </h2>
              <p>
                CalFlow se proporciona &quot;tal cual&quot; (&quot;as is&quot;) y &quot;según disponibilidad&quot;. En la máxima medida permitida por la ley aplicable, CalFlow no será responsable por pérdidas indirectas, lucro cesante o daños resultantes de la imposibilidad de asistir a reuniones, fallos en la conectividad de Google Calendar o Google Meet, o interrupciones imprevistas del servicio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                7. Modificaciones a las Condiciones
              </h2>
              <p>
                Podemos actualizar estas Condiciones periódicamente para reflejar cambios en nuestras funciones o requerimientos normativos. Cualquier modificación entrará en vigor inmediatamente después de su publicación en esta página.
              </p>
            </section>
          </div>

          {/* Bottom navigation */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} CalFlow SaaS. Todos los derechos reservados.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Políticas de Privacidad
              </Link>
              <Link href="/" className="text-slate-600 hover:underline">
                Página Principal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
