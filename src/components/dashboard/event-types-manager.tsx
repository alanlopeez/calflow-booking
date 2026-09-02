"use client";

import { useState } from "react";
import {
  Plus,
  Clock,
  Video,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createEventType,
  updateEventType,
  deleteEventType,
  toggleEventTypeActive,
} from "@/actions/event-types";
import { toast } from "sonner";
import Link from "next/link";

interface EventTypeItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  isActive: boolean;
  bufferBefore: number;
  bufferAfter: number;
  color: string;
  locations: string;
}

const COLOR_PRESETS = [
  "#0f172a", // Slate / Black
  "#2563eb", // Blue
  "#7c3aed", // Purple
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Red
  "#ec4899", // Pink
];

export function EventTypesManager({
  initialEventTypes,
  username,
}: {
  initialEventTypes: EventTypeItem[];
  username: string;
}) {
  const [eventTypes, setEventTypes] = useState(initialEventTypes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventTypeItem | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [color, setColor] = useState("#0f172a");

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setDuration(30);
    setBufferBefore(0);
    setBufferAfter(0);
    setColor("#0f172a");
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventTypeItem) => {
    setEditingEvent(event);
    setTitle(event.title);
    setSlug(event.slug);
    setDescription(event.description || "");
    setDuration(event.duration);
    setBufferBefore(event.bufferBefore);
    setBufferAfter(event.bufferAfter);
    setColor(event.color);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingEvent) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await updateEventType(editingEvent.id, {
          title,
          slug,
          description,
          duration: Number(duration),
          bufferBefore: Number(bufferBefore),
          bufferAfter: Number(bufferAfter),
          color,
        });
        toast.success("Tipo de evento actualizado con éxito.");
      } else {
        await createEventType({
          title,
          slug,
          description,
          duration: Number(duration),
          bufferBefore: Number(bufferBefore),
          bufferAfter: Number(bufferAfter),
          color,
          price: 0,
          currency: "USD",
          locations: JSON.stringify([{ type: "google_meet" }]),
        });
        toast.success("Tipo de evento creado con éxito.");
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleEventTypeActive(id, !current);
      setEventTypes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !current } : item
        )
      );
      toast.success(
        !current ? "Tipo de evento activado" : "Tipo de evento desactivado"
      );
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este tipo de evento?")) return;
    try {
      await deleteEventType(id);
      setEventTypes((prev) => prev.filter((item) => item.id !== id));
      toast.success("Tipo de evento eliminado.");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const copyPublicLink = (eventSlug: string) => {
    const url = `${window.location.origin}/${username}/${eventSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(eventSlug);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Tipos de Eventos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Crea y administra los diferentes tipos de reuniones que tus clientes pueden agendar.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="rounded-2xl gap-2 font-semibold shadow-md bg-slate-950 hover:bg-black text-white"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Tipo de Evento</span>
        </Button>
      </div>

      {/* Grid of Event Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eventTypes.map((event) => (
          <Card
            key={event.id}
            className={`p-6 transition-all hover:shadow-md ${
              !event.isActive ? "opacity-60 bg-slate-50" : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: event.color }}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {event.description || "Sin descripción adicional."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge variant="pillSoft" className="text-xs">
                      {event.duration} min
                    </Badge>
                    <Badge variant="pillSoft" className="text-xs flex items-center gap-1">
                      <Video className="h-3 w-3 text-blue-600" />
                      <span>Google Meet</span>
                    </Badge>
                    {event.bufferBefore > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{event.bufferBefore}m de intervalo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={event.isActive}
                  onCheckedChange={() => handleToggle(event.id, event.isActive)}
                  title={event.isActive ? "Desactivar" : "Activar"}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyPublicLink(event.slug)}
                  className="rounded-xl text-xs gap-1.5 h-8 px-3"
                >
                  {copiedSlug === event.slug ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  <span>{copiedSlug === event.slug ? "¡Copiado!" : "Copiar Enlace"}</span>
                </Button>

                <Link href={`/${username}/${event.slug}`} target="_blank">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs gap-1 h-8 px-2 text-slate-500 hover:text-slate-900"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(event)}
                  className="rounded-xl text-xs h-8 px-2 text-slate-500 hover:text-slate-900"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                  className="rounded-xl text-xs h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Creating / Editing Event Types */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Editar Tipo de Evento" : "Crear Nuevo Tipo de Evento"}
            </DialogTitle>
            <DialogDescription>
              Configura los detalles, duración e intervalos de tiempo para esta reunión.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Título del Evento *
              </label>
              <Input
                placeholder="Ej. Sesión de Consultoría"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Enlace / Slug *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">calflow.io/{username}/</span>
                <Input
                  placeholder="sesion-consultoria"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Descripción (Opcional)
              </label>
              <Textarea
                placeholder="Describe brevemente el propósito de esta reunión..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Duration Presets */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Duración
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      duration === mins
                        ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {/* Intervalos de tiempo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Intervalo de Tiempo Previo (min)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Intervalo de Tiempo Posterior (min)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Color de Identificación
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      color === c ? "scale-125 ring-2 ring-slate-900 ring-offset-2" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-slate-950 hover:bg-black text-white"
              >
                {isSubmitting ? "Guardando..." : editingEvent ? "Actualizar" : "Crear Evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
