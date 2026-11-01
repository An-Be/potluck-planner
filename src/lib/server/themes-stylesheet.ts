import "server-only";
import { createHash } from "node:crypto";
import { allThemesCss } from "@/lib/themes";

// Versioned URL for /themes.css: the hash changes whenever a theme does, so
// the sheet can be cached forever and a deploy still picks up new themes.
const version = createHash("sha256").update(allThemesCss()).digest("hex").slice(0, 10);

export const themesStylesheetHref = `/themes.css?v=${version}`;
