export interface EventTypeCustomInput {
  id: string;
  type: "text" | "textarea" | "number" | "select" | "phone";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
}

export interface EventLocation {
  type: "google_meet" | "phone" | "in_person" | "custom";
  address?: string;
  phone?: string;
}

export interface DayAvailability {
  day: number; // 0 (Sun) to 6 (Sat)
  enabled: boolean;
  slots: { startTime: string; endTime: string }[];
}

export interface TimeSlot {
  time: string; // ISO string in UTC or formatted local time
  startTime: string; // "2026-09-02T15:00:00.000Z"
  endTime: string;   // "2026-09-02T15:30:00.000Z"
  displayTime: string; // "10:00 AM" in guest timezone
  available: boolean;
}

export interface BookingWithDetails {
  id: string;
  guestName: string;
  guestEmail: string;
  guestNotes?: string | null;
  guestTimezone: string;
  customResponses?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
  meetLink?: string | null;
  googleEventId?: string | null;
  cancellationReason?: string | null;
  eventType: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    color: string;
  };
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}
