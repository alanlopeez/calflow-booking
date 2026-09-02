"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            Algo no salió como esperábamos
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Ha ocurrido un problema al procesar la solicitud. Por favor intenta de nuevo.
          </p>
        </div>
        <Button
          onClick={() => reset()}
          variant="default"
          className="rounded-2xl gap-2 font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Intentar de nuevo</span>
        </Button>
      </div>
    </div>
  );
}
