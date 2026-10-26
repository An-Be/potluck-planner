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

/** A maps search link for the address, or the place name when there's no address. */
export function mapsUrl(location: string, address: string): string | null {
  const query = (address || location).trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
