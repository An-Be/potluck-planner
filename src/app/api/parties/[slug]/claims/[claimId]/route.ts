import { isWellFormedId } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { readDeviceToken } from "@/lib/server/device";
import { json, notFound, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { removeClaim } from "@/lib/server/needs";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string; claimId: string }> };

// Unclaim. Guests can remove claims made from this device; the host can
// remove any claim on the party. Anything else is a plain 404.
export async function DELETE(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req, { hasBody: false });
  if (blocked) return blocked;

  const limit = await checkRateLimit(`claim:delete:${getClientIp(req)}`, { limit: 60, windowSeconds: 600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug, claimId } = await params;
  if (!isWellFormedId(claimId)) return notFound();
  const member = await getMember(slug);
  if (!member) return notFound();

  const removed = await removeClaim(
    member.partyId,
    claimId,
    member.isHost ? { asHost: true } : { asHost: false, deviceToken: await readDeviceToken() },
  );
  if (!removed) return notFound();
  return json({ ok: true });
}
