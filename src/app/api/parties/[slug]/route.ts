import { json, notFound } from "@/lib/server/http";
import { getPartyAccess } from "@/lib/server/parties";

type Ctx = { params: Promise<{ slug: string }> };

// Guest-scoped party details. Requires the guest (or host) cookie; anyone
// else gets the same 404 as a party that doesn't exist. Never includes the
// host token, guest key or password hash (see guestFields in parties.ts).
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "guest" && access.status !== "host") return notFound();
  return json({ party: access.party });
}
