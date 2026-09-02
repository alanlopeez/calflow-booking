import { format } from "date-fns";

export interface IcsEventParams {
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  organizerName?: string;
  organizerEmail?: string;
}

export function generateIcsFile(event: IcsEventParams): string {
  const formatDateToIcs = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const now = new Date();
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@calsaas.com`;

  const cleanDescription = (event.description || "").replace(/\n/g, "\\n");
  const cleanTitle = (event.title || "").replace(/\n/g, " ");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalSaaS//Booking App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDateToIcs(now)}`,
    `DTSTART:${formatDateToIcs(new Date(event.startTime))}`,
    `DTEND:${formatDateToIcs(new Date(event.endTime))}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    event.location ? `LOCATION:${event.location}` : "",
    event.organizerName && event.organizerEmail
      ? `ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerEmail}`
      : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return icsLines.join("\r\n");
}

export function getGoogleCalendarUrl(event: IcsEventParams): string {
  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
  const start = formatUtc(new Date(event.startTime));
  const end = formatUtc(new Date(event.endTime));

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set("dates", `${start}/${end}`);
  url.searchParams.set("details", event.description || "");
  if (event.location) {
    url.searchParams.set("location", event.location);
  }

  return url.toString();
}

export function getOutlookCalendarUrl(event: IcsEventParams): string {
  const url = new URL("https://outlook.live.com/calendar/0/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", event.title);
  url.searchParams.set("startdt", new Date(event.startTime).toISOString());
  url.searchParams.set("enddt", new Date(event.endTime).toISOString());
  url.searchParams.set("body", event.description || "");
  if (event.location) {
    url.searchParams.set("location", event.location);
  }

  return url.toString();
}
