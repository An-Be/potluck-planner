import "server-only";
import { cookies } from "next/headers";
import { isWellFormedToken, newToken } from "./token";

// A random per-device id in an httpOnly cookie. It lets the same phone remove
// its own claims (and, in M3, update its own RSVP). It is convenience, not
// access control: clearing cookies just means you ask the host to remove a
// claim. Never sent to the client in a response body.

const DEVICE_COOKIE = "pdev";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** The current device id, or null if this device has never claimed anything. */
export async function readDeviceToken(): Promise<string | null> {
  const value = (await cookies()).get(DEVICE_COOKIE)?.value;
  return isWellFormedToken(value) ? value : null;
}

/** Returns the device id, creating and setting it if missing. Route Handlers only. */
export async function ensureDeviceToken(): Promise<string> {
  const existing = await readDeviceToken();
  if (existing) return existing;
  const token = newToken();
  (await cookies()).set(DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return token;
}
