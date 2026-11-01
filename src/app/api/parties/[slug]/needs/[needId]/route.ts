import { isWellFormedId } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { json, notFound, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { deleteNeed } from "@/lib/server/needs";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string; needId: string }> };

// Host only: remove an item and every claim on it.
export async function DELETE(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req, { hasBody: false });
  if (blocked) return blocked;

  const limit = await checkRateLimit(`need:delete:${getClientIp(req)}`, { limit: 120, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug, needId } = await params;
  if (!isWellFormedId(needId)) return notFound();
  const member = await getMember(slug);
  if (!member?.isHost) return notFound();

  if (!(await deleteNeed(member.partyId, needId))) return notFound();
  return json({ ok: true });
}
