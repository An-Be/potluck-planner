import { buttonVariants } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { site } from "@/config/site";
import { TrackedLink } from "./tracked-link";

/** After the party: hand cost splitting to TabMath. Potluck never touches money. */
export function SplitCosts({ n, isHost }: { n: string; isHost: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel n={n}>After the party</SectionLabel>
      <p className="text-sm text-mute">
        Someone paid for the big stuff? Snap the receipt on {site.tabMath.name} and everyone pays their share. No
        sign-up.
      </p>
      <TrackedLink
        href={site.tabMath.url}
        target="_blank"
        rel="noopener noreferrer"
        event="tabmath_clicked"
        props={{ from: isHost ? "host" : "guest" }}
        className={buttonVariants({ variant: "outline", block: true })}
      >
        Split costs on {site.tabMath.name} ↗
      </TrackedLink>
    </section>
  );
}
