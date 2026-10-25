import { NextResponse } from "next/server";
import { findByHostToken, setHostCookie } from "@/lib/server/parties";

type Ctx = { params: Promise<{ token: string }> };

// The host link. Swaps the token in the URL for an httpOnly cookie, then
// redirects to the clean host page, so the token doesn't linger in the
// address bar or get shared by accident from there. The link itself keeps
// working: opening it on another device signs that device in as host.
export async function GET(req: Request, { params }: Ctx) {
  const { token } = await params;
  const party = await findByHostToken(token);
  if (!party) return NextResponse.redirect(new URL("/not-found", req.url), 303);

  await setHostCookie(party.id, party.hostToken);
  return NextResponse.redirect(new URL(`/p/${party.slug}/host`, req.url), 303);
}
