import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, getTheme, isSafeColor, themeCss, themes, type Theme } from "./themes";

describe("themes", () => {
  it("has unique, selector-safe slugs and includes the default and Plain", () => {
    const slugs = themes.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
    expect(slugs).toContain(DEFAULT_THEME);
    expect(slugs).toContain("plain");
  });

  it("only uses hex colors or base tokens", () => {
    for (const t of themes) {
      for (const v of [...Object.values(t.light), ...Object.values(t.dark)]) expect(isSafeColor(v), `${t.slug}: ${v}`).toBe(true);
    }
  });

  it("rejects values that could break out of the style tag", () => {
    expect(isSafeColor("red;}body{display:none")).toBe(false);
    expect(isSafeColor("</style>")).toBe(false);
    expect(isSafeColor("var(--color-ink)")).toBe(true);
    expect(isSafeColor("#a3182b")).toBe(true);
  });

  it("falls back to Plain for an unknown slug", () => {
    expect(getTheme("gone").slug).toBe("plain");
    expect(getTheme("holiday-classic").name).toBe("Holiday Classic");
  });

  it("scopes css to the theme and adds a dark block", () => {
    const css = themeCss(getTheme("holiday-classic"));
    expect(css).toContain('[data-theme="holiday-classic"]{--theme-accent:#a3182b;');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("--theme-tint:#0d1712");
  });

  it("throws on an unsafe theme instead of writing it", () => {
    const bad: Theme = { ...getTheme("plain"), light: { ...getTheme("plain").light, tint: "red}" } };
    expect(() => themeCss(bad)).toThrow();
  });
});
