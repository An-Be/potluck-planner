import { getClientIp } from "@/lib/server/client-ip";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { getPasswordCheck, setGuestCookie } from "@/lib/server/parties";
import { verifyPassword } from "@/lib/server/password";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { unlockSchema } from "@/lib/party-schema";

type Ctx = { params: Promise<{ slug: string }> };

// Guest password gate. The limit is per person (IP) per party and only slows
// guessing down; there is no lockout, so a typo-prone uncle can't brick the
// party for everyone.
export async function POST(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const { slug } = await params;
  const limit = await checkRateLimit(`party:unlock:${slug.slice(0, 48)}:${getClientIp(req)}`, {
    limit: 20,
    windowSeconds: 600,
  });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const party = await getPasswordCheck(slug);
  if (!party) return notFound();

  const body = await parseJsonBody(req, unlockSchema);
  if (!body.ok) return body.response;

  if (!(await verifyPassword(body.data.password, party.guestPasswordHash))) {
    return json({ error: "That's not it. Check with your host." }, 401);
  }
  await setGuestCookie(party.id, party.guestKey);
  return json({ ok: true });
}
