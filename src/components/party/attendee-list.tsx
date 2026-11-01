"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { formatBringing, headcount, type AttendeeView, type BringerView, type RsvpStatus } from "@/lib/rsvp";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { ConfirmDialog, type ConfirmRequest } from "./confirm-dialog";

const groups: { status: RsvpStatus; title: string }[] = [
  { status: "COMING", title: "Coming" },
  { status: "MAYBE", title: "Maybe" },
  { status: "CANT", title: "Can't make it" },
];

/** Headcount, then who's coming and what each person is bringing. */
export function AttendeeList({
  slug,
  attendees,
  bringers,
  isHost,
}: {
  slug: string;
  attendees: AttendeeView[];
  bringers: BringerView[];
  isHost: boolean;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [pending, setPending] = useState(false);
  const count = headcount(attendees);

  function askRemove(a: AttendeeView) {
    setConfirm({
      title: `Remove ${a.name}'s RSVP?`,
      description: "They come off the guest list. Anything they claimed stays on the needs list.",
      confirmLabel: "Remove",
      run: async () => {
        setPending(true);
        const res = await api<{ ok: true }>(`/api/parties/${slug}/rsvps/${a.id}`, { method: "DELETE" });
        setPending(false);
        setConfirm(null);
        if (!res.ok && res.status !== 404) {
          toast.error(res.error);
          return;
        }
        track("rsvp_removed", { by: "host" });
        router.refresh();
      },
    });
  }

  if (attendees.length === 0 && bringers.length === 0) {
    return (
      <p className="border border-dashed border-ink bg-paper p-4 text-sm text-mute">
        {isHost ? "No RSVPs yet. Share the link and password to get some." : "No RSVPs yet. Be the first."}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="display text-3xl">{count.coming} coming</p>
        <p className="text-xs text-mute">
          {[count.maybe ? `${count.maybe} maybe` : null, count.cant ? `${count.cant} can't make it` : null]
            .filter(Boolean)
            .join(" · ") || "Headcount counts everyone in each group."}
        </p>
      </div>

      {groups.map(({ status, title }) => {
        const people = attendees.filter((a) => a.status === status);
        if (people.length === 0) return null;
        return (
          <div key={status}>
            <h3 className="label mb-2 text-mute">
              {title} · {status === "CANT" ? people.length : people.reduce((n, a) => n + a.partySize, 0)}
            </h3>
            <ul className="border border-ink bg-paper">
              {people.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b border-ink p-4 last:border-b-0">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-display text-lg font-medium break-words">
                      {a.name}
                      {status !== "CANT" && a.partySize > 1 ? <span className="text-mute"> +{a.partySize - 1}</span> : null}
                      {a.mine ? <span className="label ml-2 text-mute">You</span> : null}
                    </p>
                    {a.bringing.length > 0 ? (
                      <p className="text-sm break-words">
                        <span className="text-mute">Bringing </span>
                        {formatBringing(a.bringing)}
                      </p>
                    ) : null}
                    {a.note ? <p className="text-xs break-words whitespace-pre-line text-mute">{a.note}</p> : null}
                  </div>
                  {isHost ? (
                    <Button variant="ghost" size="sm" className="h-auto shrink-0 px-0" disabled={pending} onClick={() => askRemove(a)}>
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {bringers.length > 0 ? (
        <div>
          <h3 className="label mb-2 text-mute">Bringing something, no RSVP yet</h3>
          <ul className="border border-ink bg-paper">
            {bringers.map((b, i) => (
              <li key={`${b.name}-${i}`} className="flex flex-col gap-1 border-b border-ink p-4 last:border-b-0">
                <p className="font-display text-lg font-medium break-words">{b.name}</p>
                <p className="text-sm break-words">
                  <span className="text-mute">Bringing </span>
                  {formatBringing(b.bringing)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ConfirmDialog request={confirm} pending={pending} onClose={() => setConfirm(null)} />
    </>
  );
}
