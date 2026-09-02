"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  FileText,
  XCircle,
  Download,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cancelBooking } from "@/actions/bookings";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingItem {
  id: string;
  guestName: string;
  guestEmail: string;
  guestNotes: string | null;
  guestTimezone: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  meetLink: string | null;
  cancellationReason: string | null;
  eventType: {
    title: string;
    duration: number;
    color: string;
  };
}

export function BookingsManager({
  bookings,
}: {
  bookings: BookingItem[];
}) {
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startTime) >= now && b.status === "CONFIRMED"
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.startTime) < now && b.status === "CONFIRMED"
  );
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  const openCancelModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsCancelling(true);
    try {
      await cancelBooking(selectedBooking.id, cancelReason);
      toast.success("Reunión cancelada y eliminada de Google Calendar.");
      setIsCancelModalOpen(false);
      window.location.reload();
    } catch {
      toast.error("Error al cancelar la reunión.");
    } finally {
      setIsCancelling(false);
    }
  };

  const renderBookingList = (list: BookingItem[], emptyMsg: string) => {
    if (list.length === 0) {
      return (
        <Card className="p-10 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{emptyMsg}</h3>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((booking) => {
          const start = new Date(booking.startTime);
          const isCancelled = booking.status === "CANCELLED";

          return (
            <Card
              key={booking.id}
              className={`p-6 transition-all hover:shadow-md ${
                isCancelled ? "bg-slate-50/70 opacity-75" : "bg-white"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: Date & Meeting Info */}
                <div className="flex items-start gap-4">
                  <div
                    className="h-12 w-12 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: booking.eventType?.color || "#0f172a" }}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {format(start, "MMM", { locale: es })}
                    </span>
                    <span className="text-base font-extrabold leading-none">
                      {format(start, "dd")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {booking.eventType?.title || "Reunión"}
                      </h3>
                      <Badge
                        variant={
                          isCancelled
                            ? "destructive"
                            : new Date(booking.startTime) >= now
                            ? "success"
                            : "secondary"
                        }
                      >
                        {isCancelled
                          ? "Cancelada"
                          : new Date(booking.startTime) >= now
                          ? "Confirmada"
                          : "Finalizada"}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {format(start, "EEEE dd 'de' MMMM · hh:mm a", { locale: es })} ({booking.eventType?.duration} min)
                      </span>
                    </p>

                    {/* Guest info */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {booking.guestName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {booking.guestEmail}
                      </span>
                    </div>

                    {booking.guestNotes && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 max-w-xl">
                        <strong className="text-slate-700">Notas:</strong> {booking.guestNotes}
                      </p>
                    )}

                    {isCancelled && booking.cancellationReason && (
                      <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 mt-2 max-w-xl">
                        <strong>Motivo de cancelación:</strong> {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                  {booking.meetLink && !isCancelled && (
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="sm"
                        variant="default"
                        className="rounded-xl text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold w-full"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Unirse a Google Meet</span>
                      </Button>
                    </a>
                  )}

                  <div className="flex items-center gap-1.5">
                    <a href={`/api/ics?bookingId=${booking.id}`} download>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1 h-8 px-2.5 text-slate-600"
                        title="Descargar archivo .ics"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>.ICS</span>
                      </Button>
                    </a>

                    {!isCancelled && new Date(booking.startTime) >= now && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCancelModal(booking)}
                        className="rounded-xl text-xs gap-1 h-8 px-2.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancelar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Mis Reservas
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gestiona tus reuniones agendadas, accede a las salas de Google Meet y administra cancelaciones.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-2xl">
          <TabsTrigger value="upcoming" className="rounded-xl text-xs font-bold gap-1.5">
            <span>Próximas</span>
            <Badge variant="pillSoft" className="h-5 px-1.5 text-[10px]">
              {upcomingBookings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl text-xs font-bold gap-1.5">
            <span>Pasadas</span>
            <Badge variant="pillSoft" className="h-5 px-1.5 text-[10px]">
              {pastBookings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-xl text-xs font-bold gap-1.5">
            <span>Canceladas</span>
            <Badge variant="pillSoft" className="h-5 px-1.5 text-[10px]">
              {cancelledBookings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {renderBookingList(upcomingBookings, "No tienes reuniones próximas agendadas.")}
        </TabsContent>

        <TabsContent value="past">
          {renderBookingList(pastBookings, "No tienes reuniones pasadas registradas.")}
        </TabsContent>

        <TabsContent value="cancelled">
          {renderBookingList(cancelledBookings, "No tienes reuniones canceladas.")}
        </TabsContent>
      </Tabs>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Reunión</DialogTitle>
            <DialogDescription>
              La reunión se cancelará y se eliminará automáticamente de tu Google Calendar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCancel} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Motivo de Cancelación (Opcional)
              </label>
              <Textarea
                placeholder="Ej. Conflicto de último minuto, reprogramaremos pronto..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelModalOpen(false)}
                className="rounded-2xl"
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={isCancelling}
                variant="destructive"
                className="rounded-2xl"
              >
                {isCancelling ? "Cancelando..." : "Confirmar Cancelación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
