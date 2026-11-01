import { describe, expect, it } from "vitest";
import {
  claimedCount,
  formatQuantity,
  groupNeeds,
  isCovered,
  remaining,
  summarize,
  type ClaimView,
  type NeedView,
} from "./needs";

const claim = (quantity: number, name = "Sam"): ClaimView => ({ id: name + quantity, name, quantity, note: null, mine: false });

const need = (id: string, category: NeedView["category"], quantityNeeded: number, claims: ClaimView[] = []): NeedView => ({
  id,
  category,
  item: id,
  quantityNeeded,
  unit: null,
  note: null,
  claims,
});

describe("counts", () => {
  it("sums claim quantities", () => {
    const n = need("plates", "SUPPLY", 4, [claim(2), claim(1, "Ana")]);
    expect(claimedCount(n)).toBe(3);
    expect(remaining(n)).toBe(1);
    expect(isCovered(n)).toBe(false);
  });

  it("is covered at exactly the needed amount", () => {
    const n = need("plates", "SUPPLY", 4, [claim(4)]);
    expect(remaining(n)).toBe(0);
    expect(isCovered(n)).toBe(true);
  });

  it("never goes negative", () => {
    expect(remaining(need("ice", "DRINK", 1, [claim(3)]))).toBe(0);
  });
});

describe("summarize", () => {
  it("counts covered items, not quantities", () => {
    const needs = [need("a", "FOOD", 4, [claim(4)]), need("b", "FOOD", 10, [claim(9)]), need("c", "DRINK", 1)];
    expect(summarize(needs)).toEqual({ covered: 1, total: 3 });
  });

  it("handles an empty list", () => {
    expect(summarize([])).toEqual({ covered: 0, total: 0 });
  });
});

describe("groupNeeds", () => {
  it("uses the fixed category order, drops empty groups, keeps item order", () => {
    const groups = groupNeeds([need("cups", "SUPPLY", 1), need("wine", "DRINK", 1), need("pie", "FOOD", 1), need("tamales", "FOOD", 1)]);
    expect(groups.map((g) => g.label)).toEqual(["Food", "Drinks", "Supplies"]);
    expect(groups[0].needs.map((n) => n.id)).toEqual(["pie", "tamales"]);
  });
});

describe("formatQuantity", () => {
  it("adds the unit when there is one", () => {
    expect(formatQuantity(2, "bags")).toBe("2 bags");
    expect(formatQuantity(3, null)).toBe("3");
  });
});
