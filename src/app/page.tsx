import { CreatePartyForm } from "@/components/party/create-party-form";
import { ThemeStyle } from "@/components/party/theme-style";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SectionLabel } from "@/components/ui/section-label";
import { Shell } from "@/components/ui/shell";
import { site } from "@/config/site";
import { themes } from "@/lib/themes";

export default function Home() {
  return (
    <>
      {/* Every theme's colors, so the picker swatches are real. */}
      <ThemeStyle themes={themes} />
      <SiteHeader />
      <Shell>
        <main className="flex flex-1 flex-col gap-10 py-10">
          <section className="flex flex-col gap-4">
            <h1 className="display text-5xl">{site.name}</h1>
            <p className="text-sm text-mute">{site.description}</p>
          </section>
          <section>
            <SectionLabel n="01">Your party</SectionLabel>
            <CreatePartyForm />
          </section>
        </main>
        <SiteFooter />
      </Shell>
    </>
  );
}
