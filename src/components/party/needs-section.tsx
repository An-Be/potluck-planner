import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import type { NeedView } from "@/lib/needs";
import { NeedsBoard } from "./needs-board";
import { NeedsProgress } from "./needs-progress";

/** "What's needed": progress, an optional slot for the host's add form, then the list. */
export function NeedsSection({
  n,
  slug,
  needs,
  isHost,
  children,
}: {
  n: string;
  slug: string;
  needs: NeedView[];
  isHost: boolean;
  children?: ReactNode;
}) {
  return (
    <section id="needs" className="flex scroll-mt-4 flex-col gap-5">
      <SectionLabel n={n}>What&apos;s needed</SectionLabel>
      <NeedsProgress needs={needs} />
      {children}
      <NeedsBoard slug={slug} needs={needs} isHost={isHost} />
    </section>
  );
}
