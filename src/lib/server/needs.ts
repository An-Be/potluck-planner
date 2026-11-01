import "server-only";
import type { NeedView } from "@/lib/needs";
import { NEEDS_PER_PARTY_MAX, type AddNeedInput, type ClaimInput } from "@/lib/needs-schema";
import { db } from "./db";

/**
 * Every need for a party with its claims, oldest first. `mine` is worked out
 * here from the device cookie; the device token itself never leaves the server.
 */
export async function listNeeds(partyId: string, deviceToken: string | null): Promise<NeedView[]> {
  const rows = await db.need.findMany({
    where: { partyId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      category: true,
      item: true,
      quantityNeeded: true,
      unit: true,
      note: true,
      claims: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, quantity: true, note: true, deviceToken: true },
      },
    },
  });
  return rows.map(({ claims, ...need }) => ({
    ...need,
    claims: claims.map(({ deviceToken: owner, ...c }) => ({ ...c, mine: deviceToken !== null && owner === deviceToken })),
  }));
}

export type AddNeedResult = { ok: true; id: string } | { ok: false; reason: "full" };

export async function addNeed(partyId: string, input: AddNeedInput): Promise<AddNeedResult> {
  const [count, last] = await Promise.all([
    db.need.count({ where: { partyId } }),
    db.need.findFirst({ where: { partyId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } }),
  ]);
  if (count >= NEEDS_PER_PARTY_MAX) return { ok: false, reason: "full" };
  const need = await db.need.create({
    data: { ...input, partyId, sortOrder: (last?.sortOrder ?? -1) + 1 },
    select: { id: true },
  });
  return { ok: true, id: need.id };
}

/** Deletes the need and (by cascade) its claims. False when it isn't this party's. */
export async function deleteNeed(partyId: string, needId: string): Promise<boolean> {
  const { count } = await db.need.deleteMany({ where: { id: needId, partyId } });
  return count > 0;
}

export type ClaimResult =
  | { ok: true; id: string; remaining: number }
  | { ok: false; reason: "missing" }
  | { ok: false; reason: "too_many"; remaining: number };

/**
 * Claims part of a need without ever over-claiming. The need row is locked
 * (SELECT ... FOR UPDATE) for the length of the transaction, so two phones
 * tapping the last plate at once run one after the other: the second one
 * re-reads the claimed total after the first commits and gets "too_many".
 */
export async function claimNeed(partyId: string, deviceToken: string, input: ClaimInput): Promise<ClaimResult> {
  return db.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ quantityNeeded: number }[]>`
      SELECT "quantityNeeded" FROM "Need" WHERE "id" = ${input.needId} AND "partyId" = ${partyId} FOR UPDATE`;
    const need = locked[0];
    if (!need) return { ok: false, reason: "missing" } as const;

    const agg = await tx.claim.aggregate({ where: { needId: input.needId }, _sum: { quantity: true } });
    const left = Math.max(0, need.quantityNeeded - (agg._sum.quantity ?? 0));
    if (input.quantity > left) return { ok: false, reason: "too_many", remaining: left } as const;

    const claim = await tx.claim.create({
      data: { needId: input.needId, name: input.name, quantity: input.quantity, note: input.note, deviceToken },
      select: { id: true },
    });
    return { ok: true, id: claim.id, remaining: left - input.quantity } as const;
  });
}

/**
 * Removes a claim. Guests can only remove claims made from their own device;
 * the host (`asHost`) can remove any claim on their party. False when there's
 * nothing matching, so the route can 404 without saying which check failed.
 */
export async function removeClaim(
  partyId: string,
  claimId: string,
  who: { asHost: true } | { asHost: false; deviceToken: string | null },
): Promise<boolean> {
  const owner = who.asHost ? {} : who.deviceToken ? { deviceToken: who.deviceToken } : null;
  if (!owner) return false;
  const { count } = await db.claim.deleteMany({ where: { id: claimId, need: { partyId }, ...owner } });
  return count > 0;
}
