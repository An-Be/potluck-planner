import "server-only";
import { cookies } from "next/headers";
import { Prisma } from "@/lib/generated/prisma/client";
import type { CreatePartyInput } from "@/lib/party-schema";
import { SLUG_MAX, nextFreeSlug, slugify } from "@/lib/slug";
import { db } from "./db";
import { hashPassword, safeEqual } from "./password";
import { isWellFormedToken, newToken } from "./token";

// Access model
// - Guest: knows the slug + the password. Unlocking sets an httpOnly cookie
//   holding party.guestKey. Changing the password replaces guestKey.
// - Host: holds the host link /h/<hostToken>. Opening it sets an httpOnly
//   cookie holding the token and redirects to a clean /p/<slug>/host URL, so
//   the token doesn't sit in the address bar or browser history. A host is
//   also a guest.
// Both checks run on the server; hiding buttons is never the access control.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days: covers planning through the party

const guestCookie = (partyId: string) => `pg_${partyId}`;
const hostCookie = (partyId: string) => `ph_${partyId}`;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

const SLUG_RE = /^[a-z0-9-]{1,48}$/;

export function isWellFormedSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG_RE.test(slug);
}

// Fields a guest may see. Never includes hostToken, guestKey or the hash.
const guestFields = {
  id: true,
  slug: true,
  title: true,
  dateTime: true,
  timeZone: true,
  location: true,
  address: true,
  notes: true,
  theme: true,
} as const;

export type PartyDetails = Prisma.PartyGetPayload<{ select: typeof guestFields }>;

type AccessRow = PartyDetails & { guestKey: string; hostToken: string };

async function findForAccess(slug: unknown): Promise<AccessRow | null> {
  if (!isWellFormedSlug(slug)) return null;
  return db.party.findUnique({ where: { slug }, select: { ...guestFields, guestKey: true, hostToken: true } });
}

function strip({ guestKey: _g, hostToken: _h, ...details }: AccessRow): PartyDetails {
  return details;
}

export type PartyAccess =
  | { status: "missing" }
  | { status: "locked"; party: Pick<PartyDetails, "slug" | "theme"> }
  | { status: "guest"; party: PartyDetails }
  | { status: "host"; party: PartyDetails; hostToken: string };

/** Who the current request is for this party, from its cookies. */
export async function getPartyAccess(slug: unknown): Promise<PartyAccess> {
  const row = await findForAccess(slug);
  if (!row) return { status: "missing" };
  const jar = await cookies();
  if (safeEqual(jar.get(hostCookie(row.id))?.value, row.hostToken)) {
    return { status: "host", party: strip(row), hostToken: row.hostToken };
  }
  if (safeEqual(jar.get(guestCookie(row.id))?.value, row.guestKey)) return { status: "guest", party: strip(row) };
  return { status: "locked", party: { slug: row.slug, theme: row.theme } };
}

export async function getPasswordCheck(slug: unknown) {
  if (!isWellFormedSlug(slug)) return null;
  return db.party.findUnique({ where: { slug }, select: { id: true, guestKey: true, guestPasswordHash: true } });
}

/** Call only from a Route Handler (cookies can't be set while rendering). */
export async function setGuestCookie(partyId: string, guestKey: string) {
  (await cookies()).set(guestCookie(partyId), guestKey, cookieOptions());
}

export async function findByHostToken(token: unknown) {
  if (!isWellFormedToken(token)) return null;
  return db.party.findUnique({ where: { hostToken: token }, select: { id: true, slug: true, hostToken: true } });
}

/** Call only from a Route Handler. */
export async function setHostCookie(partyId: string, hostToken: string) {
  (await cookies()).set(hostCookie(partyId), hostToken, cookieOptions());
}

function isSlugCollision(e: unknown): boolean {
  if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2002") return false;
  return JSON.stringify(e.meta ?? {}).includes("slug");
}

/**
 * Creates the party with the first free readable slug. If two hosts race for
 * the same slug, the unique index rejects the loser and it retries with the
 * next number.
 */
export async function createParty(input: CreatePartyInput): Promise<{ id: string; slug: string; hostToken: string }> {
  const { guestPassword, ...details } = input;
  const guestPasswordHash = await hashPassword(guestPassword);
  const base = slugify(details.title);
  const prefix = base.slice(0, SLUG_MAX - 4);

  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await db.party.findMany({ where: { slug: { startsWith: prefix } }, select: { slug: true } });
    const slug = nextFreeSlug(base, taken.map((t) => t.slug));
    try {
      return await db.party.create({
        data: { ...details, slug, guestPasswordHash, guestKey: newToken(), hostToken: newToken() },
        select: { id: true, slug: true, hostToken: true },
      });
    } catch (e) {
      if (!isSlugCollision(e)) throw e;
    }
  }
  throw new Error("Could not find a free slug.");
}
