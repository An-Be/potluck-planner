import { buildIcs } from "@/lib/ics";
import { notFound } from "@/lib/server/http";
import { getPartyAccess } from "@/lib/server/parties";

type Ctx = { params: Promise<{ slug: string }> };

// "Add to calendar": a one-event .ics for anyone who has unlocked the party
// (or the host). Everyone else gets the same 404 as a missing party. Read-only,
// so no CSRF guard; /api/ responses are already no-store + noindex.
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "guest" && access.status !== "host") return notFound();
  const { party } = access;

  const ics = buildIcs({
    uid: `${party.id}@potluck`,
    title: party.title,
    start: party.dateTime,
    location: party.location,
    address: party.address,
    notes: party.notes,
    url: `${new URL(req.url).origin}/p/${party.slug}`,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Generic file name: the party's name stays out of the downloads folder listing.
      "Content-Disposition": 'attachment; filename="party.ics"',
    },
  });
}
