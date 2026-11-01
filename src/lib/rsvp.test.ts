import { describe, expect, it } from "vitest";
import { formatBringing, headcount } from "./rsvp";

describe("headcount", () => {
  it("sums party size for COMING only, counts hosts in it, keeps MAYBE separate", () => {
    expect(
      headcount([
        { status: "COMING", partySize: 2, isHost: true },
        { status: "COMING", partySize: 3, isHost: false },
        { status: "MAYBE", partySize: 4, isHost: false },
        { status: "CANT", partySize: 5, isHost: false },
        { status: "CANT", partySize: 1, isHost: false },
      ]),
    ).toEqual({ coming: 5, hosting: 2, maybe: 4, cant: 2 });
  });

  it("is zero for nobody", () => {
    expect(headcount([])).toEqual({ coming: 0, hosting: 0, maybe: 0, cant: 0 });
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
