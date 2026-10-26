import type { ReactNode } from "react";
import { getTheme } from "@/lib/themes";
import { HeaderArt } from "./header-art";
import { ThemeStyle } from "./theme-style";

/**
 * The theme overlay: sets the theme's properties on a wrapper and tints the
 * page. Everything inside keeps the base tokens (ink, paper, mute...), so the
 * Plain theme renders exactly like the template. Wrap the whole page in it,
 * header included, so the tint runs edge to edge.
 */
export function ThemeFrame({ theme: slug, header, children }: { theme: string; header: ReactNode; children: ReactNode }) {
  const theme = getTheme(slug);
  return (
    <div data-theme={theme.slug} className="flex flex-1 flex-col bg-(--theme-tint)">
      <ThemeStyle themes={[theme]} />
      {header}
      <HeaderArt art={theme.art} />
      {children}
    </div>
  );
}
