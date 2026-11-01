import { allThemesCss } from "@/lib/themes";

// Every party theme as one same-origin stylesheet (allowed by style-src 'self',
// no nonce needed). Built from src/lib/themes.ts at build time. Linked from the
// root layout with a content-hash query, so caching it for a year is safe.
export const dynamic = "force-static";

export function GET() {
  return new Response(allThemesCss(), {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
