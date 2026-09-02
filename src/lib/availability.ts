import prisma from "@/lib/prisma";
import { fetchGoogleBusyTimes } from "@/lib/google-calendar";
import { addMinutes, parse, format, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime, format as formatTz } from "date-fns-tz";
import { TimeSlot } from "@/types";

export interface GetSlotsParams {
  userId: string;
  eventTypeId: string;
  dateStr: string; // "YYYY-MM-DD"
  guestTimezone?: string;
}

export async function getAvailableSlots(params: GetSlotsParams): Promise<TimeSlot[]> {
  const { userId, eventTypeId, dateStr, guestTimezone = "UTC" } = params;

  // 1. Fetch EventType
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  });

  if (!eventType || !eventType.isActive) {
    return [];
  }

  // 2. Fetch User & Default Schedule
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      schedules: {
        where: { isDefault: true },
        include: {
          availability: true,
          dateOverrides: true,
        },
      },
    },
  });

  if (!user || user.schedules.length === 0) {
    return [];
  }

  const schedule = user.schedules[0];
  const hostTimezone = schedule.timeZone || user.timeZone || "UTC";

  // Parse target date in host timezone
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetHostDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetHostDate.getUTCDay(); // 0: Sun, 1: Mon, ...

  // Check Date Override for this exact date
  const override = schedule.dateOverrides.find((o) => {
    const oDate = new Date(o.date);
    return (
      oDate.getUTCFullYear() === year &&
      oDate.getUTCMonth() === month - 1 &&
      oDate.getUTCDate() === day
    );
  });

  if (override && override.isUnavailable) {
    return [];
  }

  // Get active time intervals for this day
  interface Interval {
    startTime: string; // "09:00"
    endTime: string;   // "17:00"
  }

  let dayIntervals: Interval[] = [];

  if (override && override.startTime && override.endTime) {
    dayIntervals.push({
      startTime: override.startTime,
      endTime: override.endTime,
    });
  } else {
    // Find in schedule availability
    for (const avail of schedule.availability) {
      try {
        const days: number[] = JSON.parse(avail.days);
        if (days.includes(dayOfWeek)) {
          dayIntervals.push({
            startTime: avail.startTime,
            endTime: avail.endTime,
          });
        }
      } catch {
        // Skip invalid json
      }
    }
  }

  if (dayIntervals.length === 0) {
    return [];
  }

  // Define full day range in UTC for querying bookings & Google Calendar
  const hostDayStartLocal = `${dateStr} 00:00:00`;
  const hostDayEndLocal = `${dateStr} 23:59:59`;
  const queryMinUtc = fromZonedTime(hostDayStartLocal, hostTimezone);
  const queryMaxUtc = fromZonedTime(hostDayEndLocal, hostTimezone);

  // 3. Fetch DB Bookings for this range
  const existingBookings = await prisma.booking.findMany({
    where: {
      userId,
      status: "CONFIRMED",
      startTime: { lte: queryMaxUtc },
      endTime: { gte: queryMinUtc },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // 4. Fetch Google Calendar FreeBusy in real-time
  const googleBusy = await fetchGoogleBusyTimes(
    userId,
    queryMinUtc.toISOString(),
    queryMaxUtc.toISOString()
  );

  const durationMinutes = eventType.duration;
  const bufferBefore = eventType.bufferBefore || 0;
  const bufferAfter = eventType.bufferAfter || 0;
  const nowUtc = new Date();

  const candidateSlots: TimeSlot[] = [];

  // Generate slots for each configured interval of the day
  for (const interval of dayIntervals) {
    const [startHour, startMin] = interval.startTime.split(":").map(Number);
    const [endHour, endMin] = interval.endTime.split(":").map(Number);

    let currentSlotStart = fromZonedTime(
      new Date(Date.UTC(year, month - 1, day, startHour, startMin, 0)),
      hostTimezone
    );
    const intervalEndUtc = fromZonedTime(
      new Date(Date.UTC(year, month - 1, day, endHour, endMin, 0)),
      hostTimezone
    );

    // Slot increment: duration (or 15 mins if duration > 30)
    const slotStep = durationMinutes >= 30 ? 30 : durationMinutes;

    while (true) {
      const currentSlotEnd = addMinutes(currentSlotStart, durationMinutes);

      if (isAfter(currentSlotEnd, intervalEndUtc)) {
        break;
      }

      // Buffer-adjusted window for conflict check
      const bufferedStart = addMinutes(currentSlotStart, -bufferBefore);
      const bufferedEnd = addMinutes(currentSlotEnd, bufferAfter);

      // Check if slot is in the past (with a 10 min minimum notice buffer)
      const isPast = isBefore(currentSlotStart, addMinutes(nowUtc, 10));

      if (!isPast) {
        // Check overlap with DB bookings
        const overlapsDb = existingBookings.some((booking) => {
          const bStart = new Date(booking.startTime);
          const bEnd = new Date(booking.endTime);
          return (
            (isBefore(bufferedStart, bEnd) && isAfter(bufferedEnd, bStart))
          );
        });

        // Check overlap with Google Busy times
        const overlapsGoogle = googleBusy.some((b) => {
          const gStart = new Date(b.start);
          const gEnd = new Date(b.end);
          return (
            (isBefore(bufferedStart, gEnd) && isAfter(bufferedEnd, gStart))
          );
        });

        if (!overlapsDb && !overlapsGoogle) {
          // Format display time in guest's timezone
          const guestZonedStart = toZonedTime(currentSlotStart, guestTimezone);
          const displayTime = formatTz(guestZonedStart, "hh:mm a", { timeZone: guestTimezone });

          candidateSlots.push({
            time: currentSlotStart.toISOString(),
            startTime: currentSlotStart.toISOString(),
            endTime: currentSlotEnd.toISOString(),
            displayTime,
            available: true,
          });
        }
      }

      // Advance by step
      currentSlotStart = addMinutes(currentSlotStart, slotStep);
    }
  }

  return candidateSlots;
}
