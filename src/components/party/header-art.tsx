import type { HeaderArt as Art } from "@/lib/themes";
import { Garland } from "./garland";

/** Decorative art under the site header, picked by the theme. */
export function HeaderArt({ art }: { art: Art }) {
  if (art === "garland") return <Garland />;
  return null;
}
