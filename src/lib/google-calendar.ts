import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/env";

export async function getGoogleOAuthClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account || !account.refresh_token) {
    return null;
  }

  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${appUrl}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Check if token needs refresh
  const isExpired = account.expires_at ? Date.now() >= account.expires_at * 1000 - 60000 : true;

  if (isExpired && account.refresh_token) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
          refresh_token: credentials.refresh_token || account.refresh_token,
        },
      });
    } catch (error) {
      console.error("Error refreshing Google OAuth access token:", error);
      return null;
    }
  }

  return oauth2Client;
}

export async function fetchGoogleBusyTimes(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<{ start: string; end: string }[]> {
  const auth = await getGoogleOAuthClient(userId);
  if (!auth) {
    return [];
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: "primary" }],
      },
    });

    const busy = response.data.calendars?.primary?.busy || [];
    return busy.map((b) => ({
      start: b.start || "",
      end: b.end || "",
    })).filter((b) => b.start && b.end);
  } catch (error) {
    console.error("Error querying Google Calendar freebusy:", error);
    return [];
  }
}

export interface CreateEventParams {
  userId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  timeZone: string;
  guestEmail: string;
  guestName: string;
}

export async function createGoogleCalendarEvent(params: CreateEventParams) {
  const auth = await getGoogleOAuthClient(params.userId);
  if (!auth) {
    return {
      googleEventId: null,
      meetLink: null,
    };
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const requestId = uuidv4();

    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: params.startTime.toISOString(),
          timeZone: params.timeZone,
        },
        end: {
          dateTime: params.endTime.toISOString(),
          timeZone: params.timeZone,
        },
        attendees: [
          {
            email: params.guestEmail,
            displayName: params.guestName,
          },
        ],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });

    const meetLink =
      event.data.hangoutLink ||
      event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri ||
      null;

    return {
      googleEventId: event.data.id || null,
      meetLink,
    };
  } catch (error) {
    console.error("Error creating Google Calendar event with Meet link:", error);
    return {
      googleEventId: null,
      meetLink: null,
    };
  }
}

export async function deleteGoogleCalendarEvent(userId: string, googleEventId: string) {
  const auth = await getGoogleOAuthClient(userId);
  if (!auth) return false;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
      sendUpdates: "all",
    });
    return true;
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    return false;
  }
}
