import { claimSchema } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { ensureDeviceToken } from "@/lib/server/device";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { claimNeed } from "@/lib/server/needs";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Guest or host: claim some of an item. Over-claiming is blocked inside a
// locked transaction (claimNeed), and the answer says how many are left.
export async function POST(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`claim:add:${getClientIp(req)}`, { limit: 60, windowSeconds: 600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) return notFound();

  const body = await parseJsonBody(req, claimSchema);
  if (!body.ok) return body.response;

  const deviceToken = await ensureDeviceToken();
  const result = await claimNeed(member.partyId, deviceToken, body.data);
  if (!result.ok && result.reason === "missing") return notFound();
  if (!result.ok) {
    const error =
      result.remaining === 0
        ? "Someone just covered that one."
        : `Only ${result.remaining} left now. Someone just claimed some.`;
    return json({ error, remaining: result.remaining }, 409);
  }
  return json({ id: result.id, remaining: result.remaining }, 201);
}
