import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      timeZone?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    timeZone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    username?: string;
    timeZone?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
