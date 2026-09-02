import Link from "next/link";
import { Calendar, ArrowLeft, Shield, Lock, Eye, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Políticas de Privacidad | CalFlow",
  description: "Política de privacidad y protección de datos personales de CalFlow y el uso de las APIs de Google.",
};

export default function PrivacyPolicyPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Transparencia y Seguridad</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Políticas de Privacidad de la Aplicación
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Última actualización: Septiembre de 2026
            </p>
          </div>

          {/* Intro */}
          <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed">
            <p>
              En <strong>CalFlow</strong> nos tomamos muy en serio la confidencialidad y protección de los datos de nuestros usuarios y de los invitados que reservan reuniones. Esta Política de Privacidad describe qué información recopilamos, cómo la usamos, cómo la protegemos y los derechos que tienes sobre tus datos personales.
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Cero Venta de Datos</h4>
              <p className="text-xs text-slate-500">Nunca comercializamos ni vendemos tus datos a anunciantes o terceros.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Sincronización Estricta</h4>
              <p className="text-xs text-slate-500">Solo leemos horarios ocupados para evitar colisiones y agendar eventos.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Control Total</h4>
              <p className="text-xs text-slate-500">Puedes desconectar tu cuenta o eliminar tus datos en cualquier momento.</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-sm sm:text-base text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>1. Información que recopilamos</span>
              </h2>
              <p>
                Para prestar el servicio de agendamiento automatizado, recopilamos la siguiente información:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Información de la cuenta de Google:</strong> Tu nombre, dirección de correo electrónico, foto de perfil e identificador único proporcionados por el protocolo OAuth 2.0 de Google.</li>
                <li><strong>Datos de Disponibilidad de Calendario:</strong> Rangos horarios de eventos ocupados/libres para calcular tu disponibilidad de reservas en tiempo real.</li>
                <li><strong>Información de Reservas e Invitados:</strong> Nombre, correo electrónico, zona horaria y notas/respuestas ingresadas por las personas que reservan citas contigo.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>2. Uso de los Datos de la API de Google (Google API Disclosure)</span>
              </h2>
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-700 text-sm space-y-2">
                <p className="font-semibold text-blue-900">
                  Cumplimiento con la Política de Datos de Usuario de los Servicios de API de Google:
                </p>
                <p>
                  El uso y la transferencia que realiza CalFlow a cualquier otra aplicación de la información recibida de las APIs de Google se adherirá estrictamente a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Política de Datos de Usuario de los Servicios de API de Google</a>, incluidos los <strong>requisitos de uso limitado (Limited Use Requirements)</strong>.
                </p>
              </div>
              <p>
                Específicamente respecto al alcance <code>https://www.googleapis.com/auth/calendar.events</code>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Solo creamos, actualizamos o cancelamos eventos que hayan sido directamente gestionados o confirmados mediante nuestra plataforma.</li>
                <li>No leemos ni almacenamos títulos privados, descripciones o asistentes de eventos que no hayan sido creados a través de CalFlow; únicamente consultamos los bloques de tiempo ocupados (Free/Busy query).</li>
                <li>No utilizamos la información obtenida de Google para entrenar modelos de inteligencia artificial ni para publicidad personalizada.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                3. Finalidad del tratamiento de datos
              </h2>
              <p>Utilizamos la información recopilada exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Permitir que los usuarios configuren tipos de eventos y compartan su enlace de reservas.</li>
                <li>Calcular espacios de tiempo libres y evitar colisiones de agenda.</li>
                <li>Generar automáticamente invitaciones en Google Calendar con enlaces a salas de Google Meet.</li>
                <li>Notificar al anfitrión y al invitado sobre el estado y confirmación de la cita.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                4. Almacenamiento y Seguridad de Datos
              </h2>
              <p>
                Implementamos estándares modernos de seguridad técnica y organizativa para proteger la confidencialidad de tus datos. Los tokens de acceso y actualización de Google se almacenan de manera segura en bases de datos PostgreSQL alojadas en proveedores con cifrado en tránsito (TLS/SSL) y en reposo.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                5. Derechos del Usuario y Revocación de Acceso
              </h2>
              <p>
                Tienes derecho a acceder, corregir o solicitar la eliminación total de tu cuenta y datos personales. Puedes revocar el acceso de CalFlow a tu cuenta de Google en cualquier momento desde la configuración de tu cuenta de Google en:
              </p>
              <p className="text-sm">
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline font-medium"
                >
                  https://myaccount.google.com/permissions
                </a>
              </p>
              <p className="text-sm">
                Si deseas la eliminación definitiva de tu cuenta y registros asociados en nuestra base de datos, puedes solicitarlo escribiendo a nuestro canal de soporte.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                6. Contacto
              </h2>
              <p className="text-sm">
                Si tienes preguntas, dudas o inquietudes sobre esta Política de Privacidad o sobre el tratamiento de tus datos, puedes contactarnos a través de nuestra plataforma o enviando un correo a soporte de CalFlow.
              </p>
            </section>
          </div>

          {/* Bottom navigation */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} CalFlow SaaS. Todos los derechos reservados.</span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-blue-600 hover:underline">
                Condiciones del Servicio
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
