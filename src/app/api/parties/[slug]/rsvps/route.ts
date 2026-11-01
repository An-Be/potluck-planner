import { rsvpSchema } from "@/lib/rsvp-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { ensureDeviceToken } from "@/lib/server/device";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { upsertRsvp } from "@/lib/server/rsvps";

type Ctx = { params: Promise<{ slug: string }> };

// Guest or host: RSVP, or change this device's RSVP (it's an upsert).
// From a host device it's saved as a host RSVP (always coming).
export async function POST(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`rsvp:set:${getClientIp(req)}`, { limit: 60, windowSeconds: 600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) return notFound();

  const body = await parseJsonBody(req, rsvpSchema);
  if (!body.ok) return body.response;

  const rsvp = await upsertRsvp(member.partyId, await ensureDeviceToken(), body.data, member.isHost);
  return json({ id: rsvp.id });
}
