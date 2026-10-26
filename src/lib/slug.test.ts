import { describe, expect, it } from "vitest";
import { SLUG_MAX, nextFreeSlug, slugify } from "./slug";

describe("slugify", () => {
  it("makes a readable slug", () => {
    expect(slugify("Andrea's Holiday Party 2026")).toBe("andreas-holiday-party-2026");
    expect(slugify("  Noche Buena!! ")).toBe("noche-buena");
    expect(slugify("Año Nuevo en Bogotá")).toBe("ano-nuevo-en-bogota");
  });

  it("falls back when nothing usable is left", () => {
    expect(slugify("🎄🎄")).toBe("party");
    expect(slugify("")).toBe("party");
  });

  it("caps the length without a trailing hyphen", () => {
    const s = slugify("a ".repeat(40) + "very long party name that keeps going");
    expect(s.length).toBeLessThanOrEqual(SLUG_MAX);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("nextFreeSlug", () => {
  it("returns the base when free", () => {
    expect(nextFreeSlug("holiday", [])).toBe("holiday");
  });

  it("appends the next number on collision", () => {
    expect(nextFreeSlug("holiday", ["holiday"])).toBe("holiday-2");
    expect(nextFreeSlug("holiday", ["holiday", "holiday-2", "holiday-3"])).toBe("holiday-4");
  });

  it("stays within the max length", () => {
    const base = "x".repeat(SLUG_MAX);
    const s = nextFreeSlug(base, [base]);
    expect(s.length).toBe(SLUG_MAX);
    expect(s.endsWith("-2")).toBe(true);
  });
});
