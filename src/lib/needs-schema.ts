import { z } from "zod";
import { CATEGORIES } from "./needs";

// Shared by the API routes (validation) and forms (limits). Pure, no server imports.
export const ITEM_MAX = 60;
export const UNIT_MAX = 20;
export const NEED_NOTE_MAX = 120;
export const NAME_MAX = 40;
export const CLAIM_NOTE_MAX = 120;
export const QUANTITY_MAX = 99;
/** A party page is one screen of needs, not an inventory. */
export const NEEDS_PER_PARTY_MAX = 100;

const squish = (s: string) => s.trim().replace(/\s+/g, " ");

const ID_RE = /^[a-z0-9]{20,32}$/;

/** Cheap format check for a row id (cuid) from a URL or body, before any query. */
export function isWellFormedId(id: unknown): id is string {
  return typeof id === "string" && ID_RE.test(id);
}

const required = (max: number, empty: string, tooLong: string) =>
  z.string({ error: empty }).transform(squish).pipe(z.string().min(1, empty).max(max, tooLong));

/** Optional free text: blank becomes null so the database never stores "". */
const optional = (max: number, tooLong: string) =>
  z
    .string({ error: "Invalid text." })
    .transform(squish)
    .pipe(z.string().max(max, tooLong))
    .transform((s) => (s ? s : null))
    .nullish()
    .transform((v) => v ?? null);

const quantity = (message: string) =>
  z.number({ error: message }).int(message).min(1, message).max(QUANTITY_MAX, `Keep it under ${QUANTITY_MAX + 1}.`);

export const addNeedSchema = z.object({
  category: z.enum(CATEGORIES, { error: "Pick a type." }),
  item: required(ITEM_MAX, "What's needed?", `Keep it under ${ITEM_MAX} characters.`),
  quantityNeeded: quantity("How many?"),
  unit: optional(UNIT_MAX, `Keep the unit under ${UNIT_MAX} characters.`),
  note: optional(NEED_NOTE_MAX, `Keep the note under ${NEED_NOTE_MAX} characters.`),
});

export const claimSchema = z.object({
  needId: z.string({ error: "Pick an item." }).regex(ID_RE, "Pick an item."),
  name: required(NAME_MAX, "Add your name so people know.", `Keep your name under ${NAME_MAX} characters.`),
  quantity: quantity("How many are you bringing?"),
  note: optional(CLAIM_NOTE_MAX, `Keep the note under ${CLAIM_NOTE_MAX} characters.`),
});

export type AddNeedInput = z.infer<typeof addNeedSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
