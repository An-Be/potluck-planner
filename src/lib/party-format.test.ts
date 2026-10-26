import { describe, expect, it } from "vitest";
import { formatPartyWhen, localInputToIso, mapsUrl } from "./party-format";

describe("formatPartyWhen", () => {
  it("formats in the party's time zone, not the server's", () => {
    const d = new Date("2026-12-20T01:00:00.000Z");
    expect(formatPartyWhen(d, "America/Chicago")).toEqual({ day: "Saturday, December 19", time: "7:00 PM CST" });
    expect(formatPartyWhen(d, "America/New_York").time).toBe("8:00 PM EST");
  });
});

describe("mapsUrl", () => {
  it("prefers the address and encodes it", () => {
    expect(mapsUrl("Andrea's", "123 N State St, Chicago")).toBe(
      "https://www.google.com/maps/search/?api=1&query=123%20N%20State%20St%2C%20Chicago",
    );
  });
  it("falls back to the place name, or nothing", () => {
    expect(mapsUrl("Millennium Park", "")).toContain("Millennium%20Park");
    expect(mapsUrl("  ", "")).toBeNull();
  });
});

describe("localInputToIso", () => {
  it("returns null for empty or garbage", () => {
    expect(localInputToIso("")).toBeNull();
    expect(localInputToIso("nope")).toBeNull();
  });
  it("returns an ISO instant", () => {
    expect(localInputToIso("2026-12-19T19:00")).toMatch(/^2026-12-\d\dT\d\d:00:00\.000Z$/);
  });
});
