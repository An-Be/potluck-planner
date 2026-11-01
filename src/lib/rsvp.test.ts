import { describe, expect, it } from "vitest";
import { formatBringing, headcount } from "./rsvp";

describe("headcount", () => {
  it("sums party size for COMING only and keeps MAYBE separate", () => {
    expect(
      headcount([
        { status: "COMING", partySize: 2 },
        { status: "COMING", partySize: 3 },
        { status: "MAYBE", partySize: 4 },
        { status: "CANT", partySize: 5 },
        { status: "CANT", partySize: 1 },
      ]),
    ).toEqual({ coming: 5, maybe: 4, cant: 2 });
  });

  it("is zero for nobody", () => {
    expect(headcount([])).toEqual({ coming: 0, maybe: 0, cant: 0 });
  });
});

describe("formatBringing", () => {
  it("shows a count only above one", () => {
    expect(
      formatBringing([
        { item: "Tamales", quantity: 6, unit: null },
        { item: "Ice", quantity: 1, unit: "bags" },
      ]),
    ).toBe("Tamales × 6, Ice");
  });
});
