"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Download,
  CalendarCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPublicBooking } from "@/actions/bookings";
import { TimeSlot } from "@/types";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from "@/lib/ics";

interface HostData {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
  username: string | null;
  bio: string | null;
  timeZone: string;
}

interface EventTypeData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  color: string;
}

const COMMON_TIMEZONES = [
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

export function PublicBookingFlow({
  host,
  eventType,
}: {
  host: HostData;
  eventType: EventTypeData;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [guestTimezone, setGuestTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || host.timeZone || "UTC";
    } catch {
      return host.timeZone || "UTC";
    }
  });

  // Slot fetching
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form State
  const [step, setStep] = useState<"select-time" | "fill-form" | "confirmed">(
    "select-time"
  );
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Confirmed booking state
  const [confirmedData, setConfirmedData] = useState<{
    id: string;
    meetLink: string | null;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Fetch slots whenever selectedDate or guestTimezone changes
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setIsLoadingSlots(true);

    fetch(
      `/api/slots?userId=${host.id}&eventTypeId=${eventType.id}&date=${dateStr}&timezone=${encodeURIComponent(
        guestTimezone
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setIsLoadingSlots(false);
      })
      .catch((err) => {
        console.error("Error loading slots:", err);
        setSlots([]);
        setIsLoadingSlots(false);
      });
  }, [selectedDate, guestTimezone, host.id, eventType.id]);

  const handleDateSelect = (day: Date) => {
    // Cannot select dates before today
    if (isBefore(day, startOfDay(new Date()))) return;
    setSelectedDate(day);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("fill-form");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const res = await createPublicBooking({
        eventTypeId: eventType.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        guestName,
        guestEmail,
        guestNotes,
        guestTimezone,
      });

      if (res.success && res.booking) {
        setConfirmedData({
          id: res.booking.id,
          meetLink: res.booking.meetLink,
          startTime: res.booking.startTime,
          endTime: res.booking.endTime,
        });
        setStep("confirmed");

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      toast.error(err.message || "Error al agendar la reunión.");
    } finally {
      setIsBooking(false);
    }
  };

  // Calendar matrix calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-3 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
        {step === "confirmed" && confirmedData ? (
          /* Confirmation Success Screen */
          <div className="p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                ¡Reunión Agendada con Éxito!
              </h2>
              <p className="text-sm text-slate-600">
                Se ha enviado una confirmación a tu correo con los detalles y el enlace de la reunión.
              </p>
            </div>

            {/* Meeting Summary Card */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-left space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: eventType.color }}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{eventType.title}</h3>
                  <p className="text-xs text-slate-500">Con {host.name}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">
                    {format(new Date(confirmedData.startTime), "EEEE dd 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold">
                    {format(new Date(confirmedData.startTime), "hh:mm a")} -{" "}
                    {format(new Date(confirmedData.endTime), "hh:mm a")} ({guestTimezone})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Google Meet</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {confirmedData.meetLink && (
                <a
                  href={confirmedData.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md"
                  >
                    <Video className="h-5 w-5" />
                    <span>Unirse a Google Meet</span>
                  </Button>
                </a>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a href={`/api/ics?bookingId=${confirmedData.id}`} download>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-700">
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar .ICS</span>
                  </Button>
                </a>

                <a
                  href={getGoogleCalendarUrl({
                    title: `${eventType.title} - ${guestName}`,
                    description: `Reunión agendada con ${host.name}.\nEnlace de Meet: ${
                      confirmedData.meetLink || ""
                    }`,
                    location: confirmedData.meetLink || "Google Meet",
                    startTime: new Date(confirmedData.startTime),
                    endTime: new Date(confirmedData.endTime),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-700">
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    <span>Añadir a Google Calendar</span>
                  </Button>
                </a>
              </div>
            </div>

            <div className="pt-4">
              <Link href={`/${host.username}`}>
                <Button variant="ghost" size="sm" className="rounded-xl text-xs text-slate-500">
                  Agendar otra reunión
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Main 2/3-Pane Booking Flow */
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
            {/* Left Column: Event & Host Details */}
            <div className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-slate-50/50">
              {step === "fill-form" && (
                <button
                  type="button"
                  onClick={() => setStep("select-time")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al calendario</span>
                </button>
              )}

              <div className="flex items-center gap-3">
                {host.image ? (
                  <Image
                    src={host.image}
                    alt={host.name || "Host"}
                    width={48}
                    height={48}
                    className="rounded-full border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center">
                    {host.name?.[0] || "U"}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    {host.name}
                  </p>
                  <h1 className="text-xl font-extrabold text-slate-950 leading-tight">
                    {eventType.title}
                  </h1>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{eventType.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span>Google Meet (videollamada generada)</span>
                </div>
                {selectedDate && selectedSlot && (
                  <div className="flex items-center gap-2.5 text-slate-900 font-bold bg-white p-2.5 rounded-xl border border-slate-200">
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <span>
                      {format(selectedDate, "EEE dd MMM", { locale: es })} · {selectedSlot.displayTime}
                    </span>
                  </div>
                )}
              </div>

              {eventType.description && (
                <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-200/60">
                  {eventType.description}
                </p>
              )}
            </div>

            {/* Middle / Right Column */}
            {step === "select-time" ? (
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                {/* Calendar Pane */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 capitalize">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                        className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                        className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 pb-1">
                    {["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"].map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((day) => {
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isPast = isBefore(day, startOfDay(new Date()));
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={!isCurrentMonth || isPast}
                          onClick={() => handleDateSelect(day)}
                          className={`h-10 sm:h-11 rounded-2xl text-xs font-bold transition-all flex items-center justify-center relative ${
                            !isCurrentMonth || isPast
                              ? "opacity-20 cursor-not-allowed text-slate-400"
                              : isSelected
                              ? "bg-slate-950 text-white shadow-md scale-105"
                              : "hover:bg-slate-100 text-slate-800"
                          } ${isTodayDate && !isSelected ? "border border-slate-900 font-extrabold" : ""}`}
                        >
                          <span>{format(day, "d")}</span>
                          {isSelected && (
                            <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timezone picker */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                    <select
                      value={guestTimezone}
                      onChange={(e) => setGuestTimezone(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none border-none cursor-pointer truncate"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slots Column */}
                <div className="w-full md:w-56 space-y-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:border-slate-100 md:pl-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {selectedDate
                      ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: es })
                      : "Selecciona una fecha"}
                  </h3>

                  {!selectedDate ? (
                    <div className="h-64 flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Elige un día en el calendario para ver los horarios disponibles.
                      </p>
                    </div>
                  ) : isLoadingSlots ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                      <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Calculando horarios...</span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No hay horarios disponibles para esta fecha.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold border border-slate-200 bg-white text-slate-800 hover:border-slate-950 hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-95 text-center"
                        >
                          {slot.displayTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: Guest Details Form */
              <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    Introduce tus datos
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completa la información para confirmar la reunión.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tu Nombre Completo *
                    </label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ej. Ana García"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tu Correo Electrónico *
                    </label>
                    <Input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Notas o Temas a Tratar (Opcional)
                    </label>
                    <Textarea
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder="Comparte cualquier contexto relevante para la reunión..."
                      rows={3}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isBooking}
                      size="lg"
                      className="w-full rounded-2xl bg-slate-950 hover:bg-black text-white font-bold text-sm shadow-md"
                    >
                      {isBooking ? "Confirmando..." : "Confirmar Reserva"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
