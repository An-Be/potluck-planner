import { SectionLabel } from "@/components/ui/section-label";
import { formatPartyWhen, mapsUrl } from "@/lib/party-format";
import type { PartyDetails as Details } from "@/lib/server/parties";

type Props = Pick<Details, "dateTime" | "timeZone" | "location" | "address" | "notes">;

/** When, where, notes: the questions nobody should have to text the host about. */
export function PartyDetails({ n = "01", dateTime, timeZone, location, address, notes }: Props & { n?: string }) {
  const when = formatPartyWhen(dateTime, timeZone);
  const map = mapsUrl(location, address);
  return (
    <section>
      <SectionLabel n={n}>Details</SectionLabel>
      <dl className="flex flex-col border border-ink bg-paper">
        <div className="flex flex-col gap-1 border-b border-ink p-4">
          <dt className="label text-mute">When</dt>
          <dd className="display text-2xl">{when.day}</dd>
          <dd className="text-sm">{when.time}</dd>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <dt className="label text-mute">Where</dt>
          <dd className="display break-words text-2xl">{location}</dd>
          {address ? <dd className="break-words text-sm">{address}</dd> : null}
          {map ? (
            <dd className="mt-1">
              <a href={map} target="_blank" rel="noopener noreferrer" className="label text-(--theme-accent) underline underline-offset-4">
                Open in maps
              </a>
            </dd>
          ) : null}
        </div>
        {notes ? (
          <div className="flex flex-col gap-1 border-t border-ink p-4">
            <dt className="label text-mute">From the host</dt>
            <dd className="whitespace-pre-line break-words text-sm">{notes}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
