// Display helpers for a party's details. Pure; safe on client and server.

/** "Saturday, December 19" and "7:00 PM CST", in the host's time zone. */
export function formatPartyWhen(date: Date, timeZone: string): { day: string; time: string } {
  const day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
  return { day, time };
}

/**
 * Map search links for the address, or the place name when there's no
 * address. Google Maps and Apple Maps, since guests are on both kinds of
 * phone; each opens that maps app if it's installed.
 */
export function mapLinks(location: string, address: string): { google: string; apple: string } | null {
  const query = (address || location).trim();
  if (!query) return null;
  const q = encodeURIComponent(query);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    apple: `https://maps.apple.com/?q=${q}`,
  };
}

/**
 * Value for an <input type="datetime-local"> -> ISO instant, using the
 * browser's own zone. Returns null for an empty or unparseable value.
 */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Editing a party's time. The edit form shows and accepts the time as wall
// clock in the PARTY's zone (not the editing device's), so a host fixing the
// time from another city doesn't shift the party.

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Offset of `tz` from UTC at instant `ms`, in ms (Chicago in winter: -6h). */
function zoneOffsetMs(ms: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** Instant -> "YYYY-MM-DDTHH:mm" in `tz`, for an <input type="datetime-local">. */
export function toZonedInput(date: Date, tz: string): string {
  const local = new Date(date.getTime() + zoneOffsetMs(date.getTime(), tz));
  return local.toISOString().slice(0, 16);
}

/**
 * "YYYY-MM-DDTHH:mm" wall clock in `tz` -> instant. Null for a malformed
 * value. A time skipped by a DST jump lands an hour later, like a phone clock.
 */
export function fromZonedInput(value: string, tz: string): Date | null {
  const m = LOCAL_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(wall)) return null;
  // Two passes: the first guess's offset can be wrong across a DST change.
  let ms = wall - zoneOffsetMs(wall, tz);
  ms = wall - zoneOffsetMs(ms, tz);
  return new Date(ms);
}
