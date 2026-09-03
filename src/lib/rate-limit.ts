import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window cache
const ipCache = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipCache.entries()) {
    if (now > record.resetTime) {
      ipCache.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  /**
   * Maximum number of allowed requests in the time window
   */
  limit: number;
  /**
   * Window size in seconds
   */
  windowSeconds: number;
}

export function getClientIp(): string {
  try {
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // If called outside of request context
  }
  return "127.0.0.1";
}

/**
 * Checks if an identifier exceeds the rate limit
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowSeconds: 60 }
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = ipCache.get(identifier);

  if (!existing || now > existing.resetTime) {
    const record: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    ipCache.set(identifier, record);
    return {
      success: true,
      remaining: options.limit - 1,
      reset: record.resetTime,
    };
  }

  if (existing.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: options.limit - existing.count,
    reset: existing.resetTime,
  };
}
