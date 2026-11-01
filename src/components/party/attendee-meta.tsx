import type { AttendeeView } from "@/lib/rsvp";

/**
 * Small tags under a name: Hosting, Party of N, You. A separate line rather
 * than "+1" after the name, which reads wrong when the name is already two
 * people ("Andrea & Sabrina +1").
 */
export function AttendeeMeta({ attendee: a }: { attendee: AttendeeView }) {
  const tags: { key: string; text: string; accent?: boolean }[] = [];
  if (a.isHost) tags.push({ key: "host", text: "Hosting", accent: true });
  if (a.status !== "CANT" && a.partySize > 1) tags.push({ key: "size", text: `Party of ${a.partySize}` });
  if (a.mine) tags.push({ key: "you", text: "You" });
  if (tags.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((t) => (
        <span key={t.key} className={t.accent ? "label text-(--theme-accent)" : "label text-mute"}>
          {t.text}
        </span>
      ))}
    </p>
  );
}
