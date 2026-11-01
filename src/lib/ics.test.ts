import { describe, expect, it } from "vitest";
import { buildIcs, escapeText, foldLine, formatUtc } from "./ics";

describe("escapeText", () => {
  it("escapes the RFC 5545 specials", () => {
    expect(escapeText("Tamales, pie; and \\ more\nLine two")).toBe("Tamales\\, pie\\; and \\\\ more\\nLine two");
  });
});

describe("formatUtc", () => {
  it("uses UTC basic format", () => {
    expect(formatUtc(new Date("2026-12-25T02:00:00.000Z"))).toBe("20261225T020000Z");
  });
});

describe("foldLine", () => {
  const bytes = (s: string) => new TextEncoder().encode(s).length;

  it("leaves short lines alone", () => {
    expect(foldLine("SUMMARY:Noche Buena")).toBe("SUMMARY:Noche Buena");
  });

  it("folds at 75 octets with a leading space on continuations", () => {
    const folded = foldLine("DESCRIPTION:" + "x".repeat(200));
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(2);
    for (const p of parts) expect(bytes(p)).toBeLessThanOrEqual(75);
    for (const p of parts.slice(1)) expect(p.startsWith(" ")).toBe(true);
    expect(parts.map((p, i) => (i ? p.slice(1) : p)).join("")).toBe("DESCRIPTION:" + "x".repeat(200));
  });

  it("never splits a multi-byte character", () => {
    const line = "SUMMARY:" + "ñ🎄".repeat(40);
    const parts = foldLine(line).split("\r\n");
    for (const p of parts) {
      expect(bytes(p)).toBeLessThanOrEqual(75);
      expect(p).not.toMatch(/�/);
    }
    expect(parts.map((p, i) => (i ? p.slice(1) : p)).join("")).toBe(line);
  });
});

describe("buildIcs", () => {
  const ics = buildIcs({
    uid: "cmvy0abc@potluck",
    title: "Noche Buena, en casa",
    start: new Date("2026-12-25T02:00:00.000Z"),
    location: "Casa",
    address: "123 N State St, Chicago",
    notes: "Park on Elm.\nUgly sweaters.",
    url: "https://potluck.example/p/noche-buena",
    now: new Date("2026-11-01T00:00:00.000Z"),
  });

  it("is one VEVENT with CRLF line endings", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
  });

  it("has start, a three hour default end, and escaped text", () => {
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain("DTSTART:20261225T020000Z\r\n");
    expect(unfolded).toContain("DTEND:20261225T050000Z\r\n");
    expect(unfolded).toContain("SUMMARY:Noche Buena\\, en casa\r\n");
    expect(unfolded).toContain("LOCATION:Casa\\, 123 N State St\\, Chicago\r\n");
    expect(unfolded).toContain("DESCRIPTION:Park on Elm.\\nUgly sweaters.\\n\\nWhat to bring and who's coming: https://potluck.example/p/noche-buena\r\n");
    expect(unfolded).toContain("DTSTAMP:20261101T000000Z\r\n");
  });

  it("drops LOCATION when there's nothing to say", () => {
    const bare = buildIcs({ uid: "u", title: "t", start: new Date(0), location: "", address: "", notes: "", url: "https://x" });
    expect(bare).not.toContain("LOCATION:");
  });
});
