"use client";

import { useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Save,
  Globe,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveUserSchedule,
  addDateOverride,
  deleteDateOverride,
} from "@/actions/availability";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AvailabilityItem {
  id: string;
  days: string; // JSON array of numbers
  startTime: string;
  endTime: string;
}

interface DateOverrideItem {
  id: string;
  date: Date | string;
  isUnavailable: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface ScheduleData {
  id: string;
  name: string;
  timeZone: string;
  availability: AvailabilityItem[];
  dateOverrides: DateOverrideItem[];
}

const DAYS_MAP = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

const TIMEZONES = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/Madrid",
  "UTC",
];

export function AvailabilityManager({
  schedule,
}: {
  schedule: ScheduleData;
}) {
  const [timeZone, setTimeZone] = useState(schedule.timeZone || "America/Mexico_City");
  const [isSaving, setIsSaving] = useState(false);

  // Parse availability by day
  const [daySchedules, setDaySchedules] = useState<{
    [day: number]: { enabled: boolean; slots: { startTime: string; endTime: string }[] };
  }>(() => {
    const map: { [day: number]: { enabled: boolean; slots: { startTime: string; endTime: string }[] } } = {};
    DAYS_MAP.forEach((d) => {
      map[d.id] = { enabled: false, slots: [] };
    });

    schedule.availability.forEach((avail) => {
      try {
        const days: number[] = JSON.parse(avail.days);
        days.forEach((dayNum) => {
          if (map[dayNum]) {
            map[dayNum].enabled = true;
            map[dayNum].slots.push({
              startTime: avail.startTime,
              endTime: avail.endTime,
            });
          }
        });
      } catch {}
    });

    // Default 09:00 - 17:00 for any enabled day without slots
    DAYS_MAP.forEach((d) => {
      if (map[d.id].enabled && map[d.id].slots.length === 0) {
        map[d.id].slots = [{ startTime: "09:00", endTime: "17:00" }];
      }
    });

    return map;
  });

  // Date Overrides State
  const [overrides, setOverrides] = useState<DateOverrideItem[]>(schedule.dateOverrides || []);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideUnavailable, setOverrideUnavailable] = useState(true);

  const toggleDay = (dayNum: number, enabled: boolean) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayNum]: {
        enabled,
        slots: enabled && prev[dayNum].slots.length === 0 ? [{ startTime: "09:00", endTime: "17:00" }] : prev[dayNum].slots,
      },
    }));
  };

  const updateSlot = (dayNum: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    setDaySchedules((prev) => {
      const newSlots = [...prev[dayNum].slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      return {
        ...prev,
        [dayNum]: {
          ...prev[dayNum],
          slots: newSlots,
        },
      };
    });
  };

  const addSlot = (dayNum: number) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayNum]: {
        ...prev[dayNum],
        slots: [...prev[dayNum].slots, { startTime: "09:00", endTime: "17:00" }],
      },
    }));
  };

  const removeSlot = (dayNum: number, slotIndex: number) => {
    setDaySchedules((prev) => ({
      ...prev,
      [dayNum]: {
        ...prev[dayNum],
        slots: prev[dayNum].slots.filter((_, i) => i !== slotIndex),
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const availabilityPayload: { days: number[]; startTime: string; endTime: string }[] = [];

      DAYS_MAP.forEach((d) => {
        const item = daySchedules[d.id];
        if (item.enabled) {
          item.slots.forEach((s) => {
            availabilityPayload.push({
              days: [d.id],
              startTime: s.startTime,
              endTime: s.endTime,
            });
          });
        }
      });

      await saveUserSchedule({
        scheduleId: schedule.id,
        timeZone,
        availability: availabilityPayload,
      });

      toast.success("Disponibilidad y zona horaria guardadas con éxito.");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar disponibilidad");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) {
      toast.error("Selecciona una fecha.");
      return;
    }

    try {
      await addDateOverride(schedule.id, {
        date: overrideDate,
        isUnavailable: overrideUnavailable,
      });
      toast.success("Excepción de fecha agregada.");
      setIsOverrideModalOpen(false);
      window.location.reload();
    } catch {
      toast.error("Error al agregar excepción.");
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await deleteDateOverride(id);
      setOverrides((prev) => prev.filter((o) => o.id !== id));
      toast.success("Excepción eliminada.");
    } catch {
      toast.error("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Disponibilidad Horaria
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define tus horarios de atención semanales y excepciones de fechas específicas.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-2xl gap-2 font-semibold shadow-md bg-slate-950 hover:bg-black text-white"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
        </Button>
      </div>

      {/* Timezone Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tu Zona Horaria Principal</h3>
              <p className="text-xs text-slate-500">
                Los horarios que definas abajo se computarán bajo esta zona horaria.
              </p>
            </div>
          </div>

          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Weekly Schedule Matrix */}
      <Card className="p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900">Horario Semanal</h3>

        <div className="divide-y divide-slate-100">
          {DAYS_MAP.map((day) => {
            const currentDay = daySchedules[day.id];

            return (
              <div
                key={day.id}
                className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Day Toggle & Label */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <Switch
                    checked={currentDay.enabled}
                    onCheckedChange={(checked) => toggleDay(day.id, checked)}
                  />
                  <span
                    className={`text-sm font-bold ${
                      currentDay.enabled ? "text-slate-900" : "text-slate-400 line-through"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>

                {/* Slots Rows */}
                <div className="flex-1">
                  {!currentDay.enabled ? (
                    <span className="text-xs font-semibold text-slate-400">
                      No disponible / Cerrado
                    </span>
                  ) : (
                    <div className="space-y-2">
                      {currentDay.slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(day.id, index, "startTime", e.target.value)
                            }
                            className="w-32 h-9 text-xs font-semibold"
                          />
                          <span className="text-xs text-slate-400 font-bold">-</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(day.id, index, "endTime", e.target.value)
                            }
                            className="w-32 h-9 text-xs font-semibold"
                          />

                          {currentDay.slots.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSlot(day.id, index)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 rounded-xl"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSlot(day.id)}
                        className="rounded-xl text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 px-2 mt-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Agregar intervalo</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Date Overrides Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Excepciones de Fechas</h3>
            <p className="text-xs text-slate-500">
              Bloquea días específicos (vacaciones, feriados) o define horas especiales para una fecha puntual.
            </p>
          </div>

          <Button
            onClick={() => setIsOverrideModalOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar Excepción</span>
          </Button>
        </div>

        {overrides.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No tienes excepciones de fecha configuradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {overrides.map((override) => (
              <div
                key={override.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {format(new Date(override.date), "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                    {override.isUnavailable ? "Completamente Bloqueado" : "Horario Personalizado"}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOverride(override.id)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 rounded-xl"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Date Override Modal */}
      <Dialog open={isOverrideModalOpen} onOpenChange={setIsOverrideModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bloquear Fecha Específica</DialogTitle>
            <DialogDescription>
              Selecciona una fecha en la que no estarás disponible para recibir reservas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOverride} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Fecha *
              </label>
              <Input
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOverrideModalOpen(false)}
                className="rounded-2xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-2xl bg-slate-950 hover:bg-black text-white"
              >
                Guardar Excepción
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
