import { describe, expect, it } from "vitest";
import { hashPassword, safeEqual, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const stored = await hashPassword("snowman");
    expect(stored).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    expect(await verifyPassword("snowman", stored)).toBe(true);
    expect(await verifyPassword("snowmen", stored)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("snowman")).not.toBe(await hashPassword("snowman"));
  });

  it("rejects malformed stored values instead of throwing", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$abc$def")).toBe(false);
    expect(await verifyPassword("x", "scrypt$00$11")).toBe(false);
  });
});

describe("safeEqual", () => {
  it("compares exactly", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("ab", "abc")).toBe(false);
    expect(safeEqual(undefined, "abc")).toBe(false);
  });
});
