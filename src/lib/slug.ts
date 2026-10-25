// Readable party slugs: "Andrea's Holiday Party 2026" -> "andreas-holiday-party-2026".
// Slugs identify a party; the guest password is what keeps people out.

export const SLUG_MAX = 40;

export function slugify(title: string): string {
  const s = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
  return s || "party";
}

/**
 * First free slug for `base` given the slugs already taken: base, base-2,
 * base-3... The suffix is room-checked so the result never exceeds SLUG_MAX.
 */
export function nextFreeSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, SLUG_MAX - suffix.length).replace(/-+$/g, "")}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
}
