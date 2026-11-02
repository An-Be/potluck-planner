import { addNeedSchema, isWellFormedId } from "@/lib/needs-schema";
import { getClientIp } from "@/lib/server/client-ip";
import { json, notFound, parseJsonBody, rejectCrossSite, tooManyRequests } from "@/lib/server/http";
import { deleteNeed, updateNeed } from "@/lib/server/needs";
import { getMember } from "@/lib/server/parties";
import { checkRateLimit } from "@/lib/server/rate-limit";

type Ctx = { params: Promise<{ slug: string; needId: string }> };

// Host only: edit an item (name, type, quantity, unit, note). The quantity
// can't go below what's already claimed (409 with `claimed`).
export async function PATCH(req: Request, { params }: Ctx) {
  const blocked = rejectCrossSite(req);
  if (blocked) return blocked;

  const limit = await checkRateLimit(`need:edit:${getClientIp(req)}`, { limit: 120, windowSeconds: 3600 });
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const { slug, needId } = await params;
  if (!isWellFormedId(needId)) return notFound();
  const member = await getMember(slug);
  if (!member?.isHost) return notFound();

  const body = await parseJsonBody(req, addNeedSchema);
  if (!body.ok) return body.response;

  const result = await updateNeed(member.partyId, needId, body.data);
  if (!result.ok && result.reason === "missing") return notFound();
  if (!result.ok) {
    return json(
      {
        error: `Guests already claimed ${result.claimed}. Set it to ${result.claimed} or more, or remove a claim first.`,
        claimed: result.claimed,
      },
      409,
    );
  }
  return json({ ok: true });
}

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
