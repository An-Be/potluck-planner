import { SectionLabel } from "@/components/ui/section-label";
import type { Attendees } from "@/lib/server/rsvps";
import { AttendeeList } from "./attendee-list";

export function GuestsSection({ n, slug, data, isHost }: { n: string; slug: string; data: Attendees; isHost: boolean }) {
  return (
    <section id="guests" className="flex scroll-mt-4 flex-col gap-5">
      <SectionLabel n={n}>Who&apos;s coming</SectionLabel>
      <AttendeeList slug={slug} attendees={data.attendees} bringers={data.bringersWithoutRsvp} isHost={isHost} />
    </section>
  );
}
