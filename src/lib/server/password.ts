import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type BinaryLike } from "node:crypto";

// Guest password hashing. scrypt from node:crypto (memory-hard, no native
// dependency to build on Vercel). Callers pass the NORMALIZED password
// (normalizePassword in src/lib/party-schema.ts).
//
// Stored as "scrypt$<salt hex>$<hash hex>".

const KEY_LEN = 32;

function derive(password: BinaryLike, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LEN, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEY_LEN) return false;
  const key = await derive(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(key, expected);
}

/** Constant-time string compare for cookie values vs stored keys and tokens. */
export function safeEqual(a: string | undefined, b: string): boolean {
  if (!a) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
