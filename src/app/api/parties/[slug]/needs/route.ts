import { NEEDS_PER_PARTY_MAX, addNeedSchema } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { addNeed } from "@/lib/server/needs";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Host only: add an item to the needs list.
export async function POST(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`need:add:${getClientIp(req)}`, { limit: 120, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug } = await params;
  const member = await getMember(slug);
  if (!member?.isHost) return notFound();

  const body = await parseJsonBody(req, addNeedSchema);
  if (!body.ok) return body.response;

  const result = await addNeed(member.partyId, body.data);
  if (!result.ok) return json({ error: `That's the limit of ${NEEDS_PER_PARTY_MAX} items.` }, 409);
  return json({ id: result.id }, 201);
}
