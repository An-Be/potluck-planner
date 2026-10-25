import { describe, expect, it } from "vitest";
import { createPartySchema, normalizePassword, unlockSchema } from "./party-schema";

const valid = {
  title: "  Holiday   Party ",
  dateTime: "2026-12-19T19:00:00.000-06:00",
  timeZone: "America/Chicago",
  location: "Andrea's place",
  guestPassword: " Snowman ",
};

describe("normalizePassword", () => {
  it("ignores case and surrounding or repeated spaces", () => {
    expect(normalizePassword("  Snow   Man ")).toBe("snow man");
    expect(normalizePassword("SNOWMAN")).toBe(normalizePassword("snowman"));
  });
});

describe("createPartySchema", () => {
  it("accepts a minimal party and fills defaults", () => {
    const r = createPartySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.title).toBe("Holiday Party");
    expect(r.data.guestPassword).toBe("snowman");
    expect(r.data.theme).toBe("holiday-classic");
    expect(r.data.address).toBe("");
    expect(r.data.notes).toBe("");
    expect(r.data.dateTime.toISOString()).toBe("2026-12-20T01:00:00.000Z");
  });

  it("keeps line breaks in notes", () => {
    const r = createPartySchema.safeParse({ ...valid, notes: " Park on Elm.\nBring a sweater. " });
    expect(r.success && r.data.notes).toBe("Park on Elm.\nBring a sweater.");
  });

  it("rejects bad input with a readable message", () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ ...valid, title: "   " }, "Give the party a name."],
      [{ ...valid, dateTime: "next friday" }, "Pick a date and time."],
      [{ ...valid, timeZone: "Mars/Olympus" }, "Unknown time zone."],
      [{ ...valid, guestPassword: "ab" }, "Use at least 3 characters."],
      [{ ...valid, theme: "spooky" }, "Pick a theme."],
      [{ ...valid, location: "" }, "Where is it?"],
    ];
    for (const [input, message] of cases) {
      const r = createPartySchema.safeParse(input);
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0]?.message).toBe(message);
    }
  });

  it("strips unknown keys (no mass assignment)", () => {
    const r = createPartySchema.safeParse({ ...valid, hostToken: "x", slug: "mine" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect("hostToken" in r.data).toBe(false);
      expect("slug" in r.data).toBe(false);
    }
  });
});

describe("unlockSchema", () => {
  it("normalizes the guess the same way as the stored password", () => {
    const r = unlockSchema.safeParse({ password: " SnowMan" });
    expect(r.success && r.data.password).toBe("snowman");
  });
});
