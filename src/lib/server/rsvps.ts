import "server-only";
import type { AttendeeView, BringerView, BringingItem } from "@/lib/rsvp";
import type { RsvpInput } from "@/lib/rsvp-schema";
import { db } from "./db";

/**
 * One RSVP per device per party (unique index on partyId + deviceToken), so
 * answering again updates the same row instead of adding "Andrea" twice.
 */
export async function upsertRsvp(partyId: string, deviceToken: string, input: RsvpInput): Promise<{ id: string }> {
  return db.rsvp.upsert({
    where: { partyId_deviceToken: { partyId, deviceToken } },
    create: { ...input, partyId, deviceToken },
    update: input,
    select: { id: true },
  });
}

/** Guests remove their own RSVP; the host can remove any. False when nothing matched. */
export async function removeRsvp(
  partyId: string,
  rsvpId: string,
  who: { asHost: true } | { asHost: false; deviceToken: string | null },
): Promise<boolean> {
  const owner = who.asHost ? {} : who.deviceToken ? { deviceToken: who.deviceToken } : null;
  if (!owner) return false;
  const { count } = await db.rsvp.deleteMany({ where: { id: rsvpId, partyId, ...owner } });
  return count > 0;
}

function addTo(list: BringingItem[], item: string, unit: string | null, quantity: number) {
  const same = list.find((b) => b.item === item && b.unit === unit);
  if (same) same.quantity += quantity;
  else list.push({ item, unit, quantity });
}

export type Attendees = { attendees: AttendeeView[]; bringersWithoutRsvp: BringerView[] };

/**
 * The attendee list: every RSVP with what that person is bringing, matched by
 * device (the same phone that RSVP'd made the claims). People who claimed
 * items but haven't RSVP'd are listed separately so the host sees them too.
 * Device tokens are only compared here; they never leave the server.
 */
export async function listAttendees(partyId: string, deviceToken: string | null): Promise<Attendees> {
  const [rsvps, claims] = await Promise.all([
    db.rsvp.findMany({
      where: { partyId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, status: true, partySize: true, note: true, deviceToken: true },
    }),
    db.claim.findMany({
      where: { need: { partyId } },
      orderBy: { createdAt: "asc" },
      select: { name: true, quantity: true, deviceToken: true, need: { select: { item: true, unit: true } } },
    }),
  ]);

  const byDevice = new Map<string, { name: string; bringing: BringingItem[] }>();
  for (const c of claims) {
    const entry = byDevice.get(c.deviceToken) ?? { name: c.name, bringing: [] };
    entry.name = c.name; // latest name used on that device
    addTo(entry.bringing, c.need.item, c.need.unit, c.quantity);
    byDevice.set(c.deviceToken, entry);
  }

  const rsvpDevices = new Set(rsvps.map((r) => r.deviceToken));
  const attendees = rsvps.map(({ deviceToken: owner, ...r }) => ({
    ...r,
    mine: deviceToken !== null && owner === deviceToken,
    bringing: byDevice.get(owner)?.bringing ?? [],
  }));
  const bringersWithoutRsvp = [...byDevice.entries()]
    .filter(([device]) => !rsvpDevices.has(device))
    .map(([, b]) => b);

  return { attendees, bringersWithoutRsvp };
}
