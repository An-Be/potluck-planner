import { describe, expect, it } from "vitest";
import type { NeedView } from "./needs";
import { buildShareText } from "./share-text";

const need = (item: string, category: NeedView["category"], quantityNeeded: number, claimed = 0, unit: string | null = null): NeedView => ({
  id: item,
  category,
  item,
  quantityNeeded,
  unit,
  note: null,
  claims: claimed ? [{ id: "c", name: "Ana", quantity: claimed, note: null, mine: false }] : [],
});

const base = { title: "Noche Buena", day: "Thursday, December 24", time: "8:00 PM CST", url: "https://x/p/noche-buena" };

describe("buildShareText", () => {
  it("lists only what's still open, in category order, with what's left", () => {
    const text = buildShareText({
      ...base,
      needs: [
        need("Cups", "SUPPLY", 1),
        need("Coquito", "DRINK", 2, 0, "bottles"),
        need("Tamales", "FOOD", 24, 12),
        need("Pie", "FOOD", 1, 1),
      ],
    });
    expect(text).toBe(
      [
        "Noche Buena, Thursday, December 24 at 8:00 PM CST",
        "",
        "Still needed:",
        "- Tamales (12 more)",
        "- Coquito (2 bottles)",
        "- Cups",
        "",
        "Claim something: https://x/p/noche-buena",
      ].join("\n"),
    );
  });

  it("says thanks when everything is covered", () => {
    const text = buildShareText({ ...base, needs: [need("Pie", "FOOD", 1, 1)] });
    expect(text).toContain("Everything on the list is covered. Thank you!");
    expect(text).not.toContain("Still needed");
  });

  it("falls back to the link when there's no list yet", () => {
    expect(buildShareText({ ...base, needs: [] })).toBe(
      "Noche Buena, Thursday, December 24 at 8:00 PM CST\n\nDetails and RSVP: https://x/p/noche-buena",
    );
  });
});
