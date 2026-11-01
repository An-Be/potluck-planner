import { changePasswordSchema } from "@/lib/party-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { changeGuestPassword, getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Host only: set a new guest password. Signs every guest out (see changeGuestPassword).
export async function POST(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`party:password:${getClientIp(req)}`, { limit: 10, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug } = await params;
  const member = await getMember(slug);
  if (!member?.isHost) return notFound();

  const body = await parseJsonBody(req, changePasswordSchema);
  if (!body.ok) return body.response;

  await changeGuestPassword(member.partyId, body.data.guestPassword);
  return json({ ok: true });
}
