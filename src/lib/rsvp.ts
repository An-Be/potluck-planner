// RSVPs and the attendee list. Pure, no server imports; safe on client and server.

export const RSVP_STATUSES = ["COMING", "MAYBE", "CANT"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const PARTY_SIZE_MAX = 20;

const labels: Record<RsvpStatus, string> = { COMING: "Coming", MAYBE: "Maybe", CANT: "Can't make it" };

export function statusLabel(s: RsvpStatus): string {
  return labels[s];
}

/** What one person (one device) said they'd bring. */
export type BringingItem = { item: string; quantity: number; unit: string | null };

export type AttendeeView = {
  id: string;
  name: string;
  status: RsvpStatus;
  partySize: number;
  note: string | null;
  /** Decided on the server from the device cookie; the token never leaves it. */
  mine: boolean;
  /** RSVP'd from a host device. Always COMING. */
  isHost: boolean;
  bringing: BringingItem[];
};

/** Someone who claimed items from a device that hasn't RSVP'd. */
export type BringerView = { name: string; bringing: BringingItem[] };

/**
 * Headcount = the sum of party sizes for COMING only (hosts included, since
 * they eat too). `hosting` is the part of `coming` that's hosts. MAYBE is
 * counted separately so the host can plan for a range; CANT counts people.
 */
export function headcount(attendees: readonly Pick<AttendeeView, "status" | "partySize" | "isHost">[]) {
  let coming = 0;
  let hosting = 0;
  let maybe = 0;
  let cant = 0;
  for (const a of attendees) {
    if (a.status === "COMING") {
      coming += a.partySize;
      if (a.isHost) hosting += a.partySize;
    } else if (a.status === "MAYBE") maybe += a.partySize;
    else cant += 1;
  }
  return { coming, hosting, maybe, cant };
}

/** "Tamales × 6, Ice", for the attendee list. */
export function formatBringing(items: readonly BringingItem[]): string {
  return items.map((b) => (b.quantity > 1 ? `${b.item} × ${b.quantity}` : b.item)).join(", ");
}
