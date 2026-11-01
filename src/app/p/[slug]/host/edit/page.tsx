import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangePasswordForm } from "@/components/party/change-password-form";
import { EditPartyForm } from "@/components/party/edit-party-form";
import { ThemeFrame } from "@/components/party/theme-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SectionLabel } from "@/components/ui/section-label";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { toZonedInput } from "@/lib/party-format";
import { getPartyAccess } from "@/lib/server/parties";
import { getTheme, type ThemeSlug } from "@/lib/themes";

export const metadata: Metadata = { title: site.name };

// Host only, like the host page: anyone else gets the standard 404.
export default async function EditPartyPage({ params }: PageProps<"/p/[slug]/host/edit">) {
  const { slug } = await params;
  const access = await getPartyAccess(slug);
  if (access.status !== "host") notFound();
  const { party } = access;

  return (
    <ThemeFrame theme={party.theme} header={<SiteHeader right={<Link href={`/p/${party.slug}/host`}>Back</Link>} />}>
      <Shell>
        <main className="flex flex-1 flex-col gap-10 py-10">
          <section className="flex flex-col gap-3">
            <p className="label text-(--theme-accent)">Host view</p>
            <h1 className="display text-5xl">Edit party</h1>
          </section>
          <section>
            <SectionLabel n="01">Details and theme</SectionLabel>
            <EditPartyForm
              party={{
                slug: party.slug,
                title: party.title,
                localDateTime: toZonedInput(party.dateTime, party.timeZone),
                timeZone: party.timeZone,
                location: party.location,
                address: party.address,
                notes: party.notes,
                theme: getTheme(party.theme).slug as ThemeSlug,
              }}
            />
          </section>
          <section>
            <SectionLabel n="02">Guest password</SectionLabel>
            <ChangePasswordForm slug={party.slug} />
          </section>
        </main>
        <SiteFooter />
      </Shell>
    </ThemeFrame>
  );
}
