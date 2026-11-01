import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestsSection } from "@/components/party/guests-section";
import { NeedsSection } from "@/components/party/needs-section";
import { PartyDetails } from "@/components/party/party-details";
import { PartyTitle } from "@/components/party/party-title";
import { PasswordGate } from "@/components/party/password-gate";
import { RsvpCard } from "@/components/party/rsvp-card";
import { SplitCosts } from "@/components/party/split-costs";
import { ThemeFrame } from "@/components/party/theme-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SectionLabel } from "@/components/ui/section-label";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { readDeviceToken } from "@/lib/server/device";
import { listNeeds } from "@/lib/server/needs";
import { getPartyAccess } from "@/lib/server/parties";
import { listAttendees } from "@/lib/server/rsvps";

// The title never includes the party name, so link previews and browser
// history don't leak it.
export const metadata: Metadata = { title: site.name };

export default async function PartyPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status === "missing") notFound();

  if (access.status === "locked") {
    return (
      <ThemeFrame theme={access.party.theme} header={<SiteHeader />}>
        <Shell>
          <main className="flex flex-1 flex-col gap-8 py-10">
            <section className="flex flex-col gap-3">
              <p className="label text-(--theme-accent)">You&apos;re invited</p>
              <h1 className="display text-5xl">What&apos;s the password?</h1>
            </section>
            <PasswordGate slug={access.party.slug} />
          </main>
          <SiteFooter />
        </Shell>
      </ThemeFrame>
    );
  }

  const { party } = access;
  const device = await readDeviceToken();
  const [needs, guests] = await Promise.all([listNeeds(party.id, device), listAttendees(party.id, device)]);
  const mine = guests.attendees.find((a) => a.mine) ?? null;
  const header =
    access.status === "host" ? (
      <SiteHeader right={<Link href={`/p/${party.slug}/host`}>Host view</Link>} />
    ) : (
      <SiteHeader />
    );

  return (
    <ThemeFrame theme={party.theme} header={header}>
      <Shell>
        <main className="flex flex-1 flex-col gap-10 py-10">
          <PartyTitle title={party.title} theme={party.theme} kicker="You're invited" />
          <PartyDetails
            slug={party.slug}
            dateTime={party.dateTime}
            timeZone={party.timeZone}
            location={party.location}
            address={party.address}
            notes={party.notes}
          />
          <section id="rsvp" className="scroll-mt-4">
            <SectionLabel n="02">{access.status === "host" ? "You're hosting" : "Your RSVP"}</SectionLabel>
            <RsvpCard slug={party.slug} mine={mine} asHost={access.status === "host"} />
          </section>
          <NeedsSection n="03" slug={party.slug} needs={needs} isHost={false} />
          <GuestsSection n="04" slug={party.slug} data={guests} isHost={false} />
          <SplitCosts n="05" isHost={false} />
        </main>
        <SiteFooter />
      </Shell>
    </ThemeFrame>
  );
}
