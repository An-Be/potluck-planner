// Party themes: an overlay on the monochrome base, never a fork of it.
//
// This is the one file to edit to add a theme: add an object to `themes`. A
// theme only sets four CSS custom properties (accent, the text color on accent,
// the page tint and the header art color) per color scheme, picks a header art
// and an emoji. Components read the properties through Tailwind's
// `bg-(--theme-tint)` syntax, so the shared tokens in globals.css stay untouched.
//
// Documented exception to "never hard-code a color": theme colors live here.
// Values must be a hex color or a base token (`var(--color-ink)`); the theme
// test enforces that, because they are written into a <style> tag.

export type ThemeColors = {
  accent: string;
  onAccent: string;
  tint: string;
  art: string;
};

export type HeaderArt = "none" | "garland";

export type Theme = {
  slug: string;
  name: string;
  /** One line for the theme picker. */
  blurb: string;
  emoji: string;
  art: HeaderArt;
  light: ThemeColors;
  dark: ThemeColors;
};

const base: ThemeColors = {
  accent: "var(--color-ink)",
  onAccent: "var(--color-paper)",
  tint: "var(--color-paper)",
  art: "var(--color-ink)",
};

export const themes = [
  {
    slug: "holiday-classic",
    name: "Holiday Classic",
    blurb: "Deep red, gold garland, a little pine.",
    emoji: "🎄",
    art: "garland",
    light: { accent: "#a3182b", onAccent: "#ffffff", tint: "#e8f0e9", art: "#b08a24" },
    dark: { accent: "#e0525f", onAccent: "#0b0b0b", tint: "#0d1712", art: "#d8b24c" },
  },
  {
    slug: "plain",
    name: "Plain",
    blurb: "The black and white base. For any party.",
    emoji: "",
    art: "none",
    light: base,
    dark: base,
  },
] as const satisfies readonly Theme[];

export type ThemeSlug = (typeof themes)[number]["slug"];

export const DEFAULT_THEME: ThemeSlug = "holiday-classic";

export const themeSlugs = themes.map((t) => t.slug) as [ThemeSlug, ...ThemeSlug[]];

/** Falls back to Plain for a slug that no longer exists, so an old party never breaks. */
export function getTheme(slug: string): Theme {
  return themes.find((t) => t.slug === slug) ?? themes.find((t) => t.slug === "plain")!;
}

const SAFE_COLOR = /^(#[0-9a-f]{3,8}|var\(--color-[a-z]+\))$/i;

export function isSafeColor(value: string): boolean {
  return SAFE_COLOR.test(value);
}

function declarations(c: ThemeColors): string {
  return [
    `--theme-accent:${c.accent}`,
    `--theme-on-accent:${c.onAccent}`,
    `--theme-tint:${c.tint}`,
    `--theme-art:${c.art}`,
  ].join(";");
}

/**
 * The CSS for one theme, scoped to `[data-theme="<slug>"]`, with the dark
 * values under prefers-color-scheme like the base tokens. Rendered into a
 * nonce'd <style> tag (inline style attributes are blocked by the CSP).
 */
export function themeCss(theme: Theme): string {
  const all = [theme.light, theme.dark].flatMap((c) => Object.values(c));
  if (!all.every(isSafeColor)) throw new Error(`Theme ${theme.slug} has an unsafe color value.`);
  const sel = `[data-theme="${theme.slug}"]`;
  return `${sel}{${declarations(theme.light)}}@media (prefers-color-scheme: dark){${sel}{${declarations(theme.dark)}}}`;
}
