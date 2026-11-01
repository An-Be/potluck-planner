// The needs list: what the party needs and who is bringing it.
// Pure, no server imports; safe on client and server.

export const CATEGORIES = ["FOOD", "DRINK", "SUPPLY", "DECOR", "OTHER"] as const;
export type Category = (typeof CATEGORIES)[number];

const labels: Record<Category, string> = {
  FOOD: "Food",
  DRINK: "Drinks",
  SUPPLY: "Supplies",
  DECOR: "Decor",
  OTHER: "Other",
};

export function categoryLabel(c: Category): string {
  return labels[c];
}

/** One claim as a viewer sees it. `mine` is decided on the server; the device token never leaves it. */
export type ClaimView = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  mine: boolean;
};

export type NeedView = {
  id: string;
  category: Category;
  item: string;
  quantityNeeded: number;
  unit: string | null;
  note: string | null;
  claims: ClaimView[];
};

export function claimedCount(need: Pick<NeedView, "claims">): number {
  return need.claims.reduce((sum, c) => sum + c.quantity, 0);
}

/** Never negative, even if a host lowers a quantity below what's claimed later. */
export function remaining(need: Pick<NeedView, "claims" | "quantityNeeded">): number {
  return Math.max(0, need.quantityNeeded - claimedCount(need));
}

export function isCovered(need: Pick<NeedView, "claims" | "quantityNeeded">): boolean {
  return remaining(need) === 0;
}

/** "X of Y items covered": counts items, not quantities. */
export function summarize(needs: readonly NeedView[]): { covered: number; total: number } {
  return { covered: needs.filter(isCovered).length, total: needs.length };
}

export type NeedGroup = { category: Category; label: string; needs: NeedView[] };

/** Groups in a fixed category order, keeping each group's incoming order. Empty groups are dropped. */
export function groupNeeds(needs: readonly NeedView[]): NeedGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    label: categoryLabel(category),
    needs: needs.filter((n) => n.category === category),
  })).filter((g) => g.needs.length > 0);
}

/** "4 plates", "2", "1 bag of ice". The unit is free text, so it isn't pluralized. */
export function formatQuantity(n: number, unit: string | null): string {
  return unit ? `${n} ${unit}` : String(n);
}
