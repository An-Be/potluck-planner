import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddNeedForm } from "@/components/party/add-need-form";
import { GuestsSection } from "@/components/party/guests-section";
import { HostLinks } from "@/components/party/host-links";
import { NeedsSection } from "@/components/party/needs-section";
import { PartyDetails } from "@/components/party/party-details";
import { PartyTitle } from "@/components/party/party-title";
import { ThemeFrame } from "@/components/party/theme-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { readDeviceToken } from "@/lib/server/device";
import { listNeeds } from "@/lib/server/needs";
import { getPartyAccess } from "@/lib/server/parties";
import { listAttendees } from "@/lib/server/rsvps";

export const metadata: Metadata = { title: site.name };

// Host only. Without the host cookie (set by /h/<token>) this is the same 404
// as a party that doesn't exist.
export default async function HostPage({ params }: PageProps<"/p/[slug]/host">) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "host") notFound();
  const { party, hostToken } = access;
  const device = await readDeviceToken();
  const [needs, guests] = await Promise.all([listNeeds(party.id, device), listAttendees(party.id, device)]);

  return (
    <ThemeFrame
      theme={party.theme}
      header={<SiteHeader right={<Link href={`/p/${party.slug}`}>Guest view</Link>} />}
    >
      <Shell>
        <main className="flex flex-1 flex-col gap-10 py-10">
          <PartyTitle title={party.title} theme={party.theme} kicker="Host view" />
          <HostLinks slug={party.slug} hostToken={hostToken} />
          <GuestsSection n="03" slug={party.slug} data={guests} isHost />
          <NeedsSection n="04" slug={party.slug} needs={needs} isHost>
            <AddNeedForm slug={party.slug} />
          </NeedsSection>
          <PartyDetails
            n="05"
            editHref={`/p/${party.slug}/host/edit`}
            dateTime={party.dateTime}
            timeZone={party.timeZone}
            location={party.location}
            address={party.address}
            notes={party.notes}
          />
        </main>
        <SiteFooter />
      </Shell>
    </ThemeFrame>
  );
}
