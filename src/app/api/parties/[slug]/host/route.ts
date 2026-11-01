import { updatePartySchema } from "@/lib/party-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { badRequest, json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { getPartyAccess, updateParty } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Host only: edit details and theme. Guests (and everyone else) get 404.
export async function PATCH(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`party:edit:${getClientIp(req)}`, { limit: 60, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "host") return notFound();

  const body = await parseJsonBody(req, updatePartySchema);
  if (!body.ok) return body.response;

  const ok = await updateParty(access.party.id, access.party.timeZone, body.data);
  if (!ok) return badRequest("Pick a date and time.");
  return json({ ok: true });
}
