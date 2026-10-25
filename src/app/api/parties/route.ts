import { getClientIp } from "@/lib/server/client-ip";
import { json, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { createParty } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { createPartySchema } from "@/lib/party-schema";

// 1. CSRF guard  2. rate limit  3. validate  4. write  5. minimal response
export async function POST(req: Request) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`party:create:${getClientIp(req)}`, { limit: 10, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const body = await parseJsonBody(req, createPartySchema);
  if (!body.ok) return body.response;

  const party = await createParty(body.data);
  // The host token goes back only to the creator, who is sent straight to the
  // host link (/h/<token>), which swaps it for a cookie.
  return json({ hostToken: party.hostToken }, 201);
}
