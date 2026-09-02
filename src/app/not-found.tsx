import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Calendar className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">
            Página No Encontrada
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            El enlace de usuario o tipo de evento que buscas no existe o ha sido desactivado.
          </p>
        </div>
        <Link href="/">
          <Button variant="default" className="rounded-2xl gap-2 font-semibold">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
