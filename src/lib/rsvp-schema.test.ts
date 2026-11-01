import { describe, expect, it } from "vitest";
import { rsvpSchema } from "./rsvp-schema";

describe("rsvpSchema", () => {
  it("cleans input, defaults party size, nulls a blank note, strips unknown keys", () => {
    const r = rsvpSchema.safeParse({ name: "  Ana  María ", status: "COMING", note: "  ", deviceToken: "x", mine: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toEqual({ name: "Ana María", status: "COMING", partySize: 1, note: null });
  });

  it("keeps line breaks in the note", () => {
    const r = rsvpSchema.safeParse({ name: "Ben", status: "MAYBE", partySize: 2, note: "Late.\nBringing the baby." });
    expect(r.success && r.data.note).toBe("Late.\nBringing the baby.");
  });

  it("rejects bad input with readable messages", () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ name: "", status: "COMING" }, "Add your name."],
      [{ name: "A", status: "YES" }, "Pick coming, maybe or can't."],
      [{ name: "A", status: "COMING", partySize: 0 }, "How many of you?"],
      [{ name: "A", status: "COMING", partySize: 2.5 }, "How many of you?"],
      [{ name: "A", status: "COMING", partySize: 21 }, "Up to 20. Tell the host about bigger groups."],
    ];
    for (const [input, message] of cases) {
      const r = rsvpSchema.safeParse(input);
      expect(r.success, JSON.stringify(input)).toBe(false);
      if (!r.success) expect(r.error.issues[0]?.message).toBe(message);
    }
  });
});
