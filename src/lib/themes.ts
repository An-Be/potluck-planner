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

export type HeaderArt = "none" | "garland" | "snowflakes" | "confetti" | "knit" | "leaves";

export type Theme = {
  slug: string;
  name: string;
  /** One line for the theme picker. */
  blurb: string;
  emoji: string;
  art: HeaderArt;
  /**
   * "dark" keeps the page dark even when the device is in light mode, by
   * re-pointing the base tokens (ink, paper...) to their dark values inside
   * this theme's scope only. globals.css itself is never touched.
   */
  scheme?: "dark";
  light: ThemeColors;
  dark: ThemeColors;
};

// Mirrors the dark block in src/app/globals.css. Used only by `scheme: "dark"` themes.
const darkTokens: Record<string, string> = {
  "--color-ink": "#f2f2f2",
  "--color-paper": "#0b0b0b",
  "--color-mute": "#a6a6a6",
  "--color-faint": "#767676",
  "--color-wash": "#1c1c1c",
  "--color-rule": "#262626",
  "--color-line": "#f2f2f2",
};

const base: ThemeColors = {
  accent: "var(--color-ink)",
  onAccent: "var(--color-paper)",
  tint: "var(--color-paper)",
  art: "var(--color-ink)",
};

export const themes = [
  {
    slug: "thanksgiving",
    name: "Thanksgiving",
    blurb: "Rust and gold, falling leaves, a warm wheat tint.",
    emoji: "🦃",
    art: "leaves",
    light: { accent: "#a8401c", onAccent: "#ffffff", tint: "#f2e4c9", art: "#c4881c" },
    dark: { accent: "#f07a48", onAccent: "#0b0b0b", tint: "#1c140b", art: "#e0a83c" },
  },
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
    slug: "winter-wonderland",
    name: "Winter Wonderland",
    blurb: "Icy blue, falling snowflakes, a pale frost.",
    emoji: "❄️",
    art: "snowflakes",
    light: { accent: "#1d5c94", onAccent: "#ffffff", tint: "#e7f0f8", art: "#7fb0d8" },
    dark: { accent: "#8cc4f2", onAccent: "#0b0b0b", tint: "#0b1520", art: "#b9dcf5" },
  },
  {
    slug: "new-years-eve",
    name: "New Year's Eve",
    blurb: "Black and gold with confetti. Always dark.",
    emoji: "✨",
    art: "confetti",
    scheme: "dark",
    light: { accent: "#d9b44a", onAccent: "#0b0b0b", tint: "#14110a", art: "#f2d27a" },
    dark: { accent: "#d9b44a", onAccent: "#0b0b0b", tint: "#14110a", art: "#f2d27a" },
  },
  {
    slug: "cozy-cabin",
    name: "Cozy Cabin",
    blurb: "Warm amber, a knit band, cream like cocoa.",
    emoji: "🕯️",
    art: "knit",
    light: { accent: "#9e540a", onAccent: "#ffffff", tint: "#f6efe2", art: "#7a4a2a" },
    dark: { accent: "#f0a24a", onAccent: "#0b0b0b", tint: "#1a130c", art: "#c9905e" },
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
 * values under prefers-color-scheme like the base tokens.
 */
export function themeCss(theme: Theme): string {
  const forced = theme.scheme === "dark" ? Object.values(darkTokens) : [];
  const all = [theme.light, theme.dark].flatMap((c) => Object.values(c)).concat(forced);
  if (!all.every(isSafeColor)) throw new Error(`Theme ${theme.slug} has an unsafe color value.`);
  const sel = `[data-theme="${theme.slug}"]`;
  if (theme.scheme === "dark") {
    const tokens = Object.entries(darkTokens).map(([k, v]) => `${k}:${v}`).join(";");
    // Same values in both modes; color-scheme makes native inputs dark too.
    return `${sel}{color-scheme:dark;color:var(--color-ink);${tokens};${declarations(theme.dark)}}`;
  }
  return `${sel}{${declarations(theme.light)}}@media (prefers-color-scheme: dark){${sel}{${declarations(theme.dark)}}}`;
}

/**
 * Every theme's CSS in one sheet, served as /themes.css (src/app/themes.css).
 * A same-origin stylesheet instead of a nonce'd <style> tag: a client-side
 * navigation brings a new request nonce that the page's CSP doesn't know, so
 * a <style> rendered during navigation would be blocked.
 */
export function allThemesCss(): string {
  return themes.map(themeCss).join("\n");
}
