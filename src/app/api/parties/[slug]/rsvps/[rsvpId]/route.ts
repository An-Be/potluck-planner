import { isWellFormedId } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { readDeviceToken } from "@/lib/server/device";
import { json, notFound, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { removeRsvp } from "@/lib/server/rsvps";

type Ctx = { params: Promise<{ slug: string; rsvpId: string }> };

// Remove an RSVP: this device's own, or any one for the host.
export async function DELETE(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req, { hasBody: false });
  if (blocked) return blocked;

  const limit = await checkRateLimit(`rsvp:delete:${getClientIp(req)}`, { limit: 60, windowSeconds: 600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug, rsvpId } = await params;
  if (!isWellFormedId(rsvpId)) return notFound();
  const member = await getMember(slug);
  if (!member) return notFound();

  const removed = await removeRsvp(
    member.partyId,
    rsvpId,
    member.isHost ? { asHost: true } : { asHost: false, deviceToken: await readDeviceToken() },
  );
  if (!removed) return notFound();
  return json({ ok: true });
}
