import { describe, expect, it } from "vitest";
import { addNeedSchema, claimSchema, isWellFormedId } from "./needs-schema";

describe("addNeedSchema", () => {
  it("cleans text and turns blank optionals into null", () => {
    const r = addNeedSchema.safeParse({ category: "FOOD", item: "  Tamales  ", quantityNeeded: 24, unit: " ", note: "" });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toEqual({ category: "FOOD", item: "Tamales", quantityNeeded: 24, unit: null, note: null });
  });

  it("accepts missing optionals", () => {
    const r = addNeedSchema.safeParse({ category: "DRINK", item: "Ice", quantityNeeded: 2 });
    expect(r.success && r.data.unit).toBe(null);
  });

  it("rejects bad input with a readable message", () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ category: "SNACKS", item: "x", quantityNeeded: 1 }, "Pick a type."],
      [{ category: "FOOD", item: "  ", quantityNeeded: 1 }, "What's needed?"],
      [{ category: "FOOD", item: "x", quantityNeeded: 0 }, "How many?"],
      [{ category: "FOOD", item: "x", quantityNeeded: 1.5 }, "How many?"],
      [{ category: "FOOD", item: "x", quantityNeeded: "3" }, "How many?"],
      [{ category: "FOOD", item: "x", quantityNeeded: 100 }, "Keep it under 100."],
    ];
    for (const [input, message] of cases) {
      const r = addNeedSchema.safeParse(input);
      expect(r.success, JSON.stringify(input)).toBe(false);
      if (!r.success) expect(r.error.issues[0]?.message).toBe(message);
    }
  });
});

describe("claimSchema", () => {
  it("accepts a claim and strips unknown keys", () => {
    const r = claimSchema.safeParse({ needId: "cmvo2h8l90000tn7d7idicleu", name: " Ana ", quantity: 2, deviceToken: "steal", mine: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data).toEqual({ needId: "cmvo2h8l90000tn7d7idicleu", name: "Ana", quantity: 2, note: null });
  });

  it("rejects a malformed need id before it reaches the database", () => {
    expect(claimSchema.safeParse({ needId: "'; drop", name: "A", quantity: 1 }).success).toBe(false);
    expect(isWellFormedId("cmvo2h8l90000tn7d7idicleu")).toBe(true);
    expect(isWellFormedId("../x")).toBe(false);
  });

  it("requires a name", () => {
    const r = claimSchema.safeParse({ needId: "cmvo2h8l90000tn7d7idicleu", name: "", quantity: 1 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe("Add your name so people know.");
  });
});
