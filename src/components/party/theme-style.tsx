import { headers } from "next/headers";
import { themeCss, type Theme } from "@/lib/themes";

/**
 * Writes the CSS custom properties for the given themes into a nonce'd
 * <style> tag. Inline style attributes are blocked by the CSP; a style tag
 * carrying the request's nonce is allowed. The CSS comes only from
 * src/lib/themes.ts (validated there), never from user input.
 */
export async function ThemeStyle({ themes }: { themes: readonly Theme[] }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return <style nonce={nonce} dangerouslySetInnerHTML={{ __html: themes.map(themeCss).join("\n") }} />;
}
