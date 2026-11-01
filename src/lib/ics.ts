// A single-event iCalendar file (RFC 5545) for "Add to calendar".
// Pure; safe on client and server.

/** Parties have no end time, so calendars get a sensible default block. */
export const DEFAULT_DURATION_MINUTES = 180;

/** TEXT values escape backslash, semicolon, comma and newlines (RFC 5545 3.3.11). */
export function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** UTC basic format: 20261225T020000Z. Calendars convert to the viewer's zone. */
export function formatUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

const encoder = new TextEncoder();

/**
 * Folds a content line at 75 octets (RFC 5545 3.1): continuation lines start
 * with one space. Counts UTF-8 bytes and never splits a character, so names
 * like "Tía Rosa" or emoji survive.
 */
export function foldLine(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines lose one byte to the leading space
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

export type IcsEvent = {
  uid: string;
  title: string;
  start: Date;
  durationMinutes?: number;
  location: string;
  address: string;
  notes: string;
  url: string;
  /** DTSTAMP; injectable for tests. */
  now?: Date;
};

export function buildIcs(e: IcsEvent): string {
  const end = new Date(e.start.getTime() + (e.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60_000);
  const where = [e.location, e.address].filter(Boolean).join(", ");
  const description = [e.notes, `What to bring and who's coming: ${e.url}`].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Potluck//Party page//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${formatUtc(e.now ?? new Date())}`,
    `DTSTART:${formatUtc(e.start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(e.title)}`,
    ...(where ? [`LOCATION:${escapeText(where)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${e.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
