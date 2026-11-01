import type { HeaderArt as Art } from "@/lib/themes";
import { Confetti } from "./confetti";
import { Garland } from "./garland";
import { Knit } from "./knit";
import { Leaves } from "./leaves";
import { Snowflakes } from "./snowflakes";

/** Decorative art under the site header, picked by the theme. */
export function HeaderArt({ art }: { art: Art }) {
  switch (art) {
    case "garland":
      return <Garland />;
    case "snowflakes":
      return <Snowflakes />;
    case "confetti":
      return <Confetti />;
    case "knit":
      return <Knit />;
    case "leaves":
      return <Leaves />;
    case "none":
      return null;
  }
}
