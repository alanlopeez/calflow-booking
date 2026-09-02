"use client";

import { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Layout,
  Maximize2,
  MousePointerClick,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EventTypeOption {
  id: string;
  title: string;
  slug: string;
}

export function EmbedBuilder({
  username,
  eventTypes,
}: {
  username: string;
  eventTypes: EventTypeOption[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(
    eventTypes.length > 0 ? eventTypes[0].slug : ""
  );
  const [embedType, setEmbedType] = useState<"inline" | "popup" | "floating">(
    "inline"
  );
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://calflow.io";
  const targetUrl = selectedSlug
    ? `${baseUrl}/embed/${username}/${selectedSlug}`
    : `${baseUrl}/embed/${username}`;

  const getEmbedCode = () => {
    if (embedType === "inline") {
      return `<!-- CalFlow Inline Embed -->
<iframe
  src="${targetUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border: 0; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);"
  allow="camera; microphone"
></iframe>`;
    }

    if (embedType === "popup") {
      return `<!-- CalFlow Popup Button Embed -->
<button
  onclick="window.open('${targetUrl}', 'CalFlowBooking', 'width=800,height=750,resizable=yes,scrollbars=yes')"
  style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 9999px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.15);"
>
  📅 Agendar Reunión
</button>`;
    }

    return `<!-- CalFlow Floating Action Button Widget -->
<div id="calflow-floating-widget" style="position: fixed; bottom: 24px; right: 24px; z-index: 99999;">
  <button
    onclick="window.open('${targetUrl}', 'CalFlowBooking', 'width=800,height=750,resizable=yes,scrollbars=yes')"
    style="background: #0f172a; color: #ffffff; padding: 14px 22px; border-radius: 9999px; font-weight: 700; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; items-center; gap: 8px;"
  >
    <span>✨ Agendar Cita</span>
  </button>
</div>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    toast.success("Código de inserción copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Incrustar Widget de Reserva (Embed Builder)
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Integra tu calendario de reservas directamente en tu sitio web, blog o landing page externa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Event */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              1. Selecciona el Tipo de Evento
            </h3>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            >
              {eventTypes.map((event) => (
                <option key={event.id} value={event.slug}>
                  {event.title} ({event.slug})
                </option>
              ))}
            </select>
          </Card>

          {/* Step 2: Select Embed Mode */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              2. Elige el Formato de Inserción
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setEmbedType("inline")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  embedType === "inline"
                    ? "bg-slate-950 text-white border-slate-950 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Iframe Inline</h4>
                    <p className="text-xs opacity-75">
                      Incrustado directamente en el cuerpo de tu página web.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEmbedType("popup")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  embedType === "popup"
                    ? "bg-slate-950 text-white border-slate-950 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MousePointerClick className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Botón con Ventana Emergente</h4>
                    <p className="text-xs opacity-75">
                      Botón estándar que abre un popup centrado.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEmbedType("floating")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  embedType === "floating"
                    ? "bg-slate-950 text-white border-slate-950 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Maximize2 className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Botón Flotante Fijo</h4>
                    <p className="text-xs opacity-75">
                      Pastilla flotante en la esquina inferior derecha del sitio.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Generated Snippet Box */}
          <Card className="p-6 space-y-4 bg-slate-950 text-white border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Código HTML Listo para Copiar
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleCopy}
                className="rounded-xl text-xs gap-1.5 bg-white text-slate-950 hover:bg-slate-100 font-bold"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-900" />
                )}
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </Button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800">
              <code>{getEmbedCode()}</code>
            </pre>
          </Card>
        </div>

        {/* Right: Live Interactive Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Vista Previa en Tiempo Real
            </h3>
            <a href={targetUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-blue-600">
                <span>Abrir en pestaña nueva</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>

          <Card className="p-4 bg-slate-100/60 border-slate-200 overflow-hidden min-h-[650px] flex flex-col justify-center">
            {embedType === "inline" ? (
              <iframe
                src={targetUrl}
                className="w-full h-[650px] rounded-2xl border border-slate-200 bg-white shadow-md"
                title="Preview"
              />
            ) : embedType === "popup" ? (
              <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500">
                  Así se verá el botón en tu página web:
                </p>
                <button
                  onClick={() =>
                    window.open(
                      targetUrl,
                      "CalFlowBooking",
                      "width=800,height=750,resizable=yes,scrollbars=yes"
                    )
                  }
                  className="bg-slate-950 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-black transition-transform active:scale-95 text-sm"
                >
                  📅 Agendar Reunión
                </button>
              </div>
            ) : (
              <div className="relative p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500">
                  El widget flotará permanentemente en la esquina de tu sitio:
                </p>
                <div className="absolute bottom-6 right-6">
                  <button
                    onClick={() =>
                      window.open(
                        targetUrl,
                        "CalFlowBooking",
                        "width=800,height=750,resizable=yes,scrollbars=yes"
                      )
                    }
                    className="bg-slate-950 text-white px-5 py-3 rounded-full font-bold shadow-xl hover:bg-black transition-transform active:scale-95 text-xs flex items-center gap-2 border border-white/20"
                  >
                    <span>✨ Agendar Cita</span>
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
