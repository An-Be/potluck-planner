import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartyDetails } from "@/components/party/party-details";
import { PartyTitle } from "@/components/party/party-title";
import { PasswordGate } from "@/components/party/password-gate";
import { ThemeFrame } from "@/components/party/theme-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { getPartyAccess } from "@/lib/server/parties";

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
