import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HostLinks } from "@/components/party/host-links";
import { PartyDetails } from "@/components/party/party-details";
import { PartyTitle } from "@/components/party/party-title";
import { ThemeFrame } from "@/components/party/theme-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { getPartyAccess } from "@/lib/server/parties";

export const metadata: Metadata = { title: site.name };

// Host only. Without the host cookie (set by /h/<token>) this is the same 404
// as a party that doesn't exist.
export default async function HostPage({ params }: PageProps<"/p/[slug]/host">) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "host") notFound();
  const { party, hostToken } = access;

  return (
    <ThemeFrame
      theme={party.theme}
      header={<SiteHeader right={<Link href={`/p/${party.slug}`}>Guest view</Link>} />}
    >
      <Shell>
        <main className="flex flex-1 flex-col gap-10 py-10">
          <PartyTitle title={party.title} theme={party.theme} kicker="Host view" />
          <HostLinks slug={party.slug} hostToken={hostToken} />
          <PartyDetails
            n="03"
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
