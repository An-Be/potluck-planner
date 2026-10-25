import { z } from "zod";
import { DEFAULT_THEME, themeSlugs } from "./themes";

// Shared by the API routes (validation) and forms (limits). Pure, no server imports.
export const TITLE_MAX = 60;
export const LOCATION_MAX = 80;
export const ADDRESS_MAX = 160;
export const NOTES_MAX = 500;
export const PASSWORD_MIN = 3;
export const PASSWORD_MAX = 40;

const squish = (s: string) => s.trim().replace(/\s+/g, " ");

/**
 * Guest passwords are said out loud, so "Snowman", "snowman " and "SNOWMAN"
 * are the same password. Applied before hashing and before comparing.
 */
export function normalizePassword(raw: string): string {
  return squish(raw).toLowerCase();
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const text = (max: number, required: string | null, tooLong: string) => {
  const base = z.string({ error: required ?? "Invalid text." }).transform(squish);
  return required
    ? base.pipe(z.string().min(1, required).max(max, tooLong))
    : base.pipe(z.string().max(max, tooLong));
};

export const guestPassword = z
  .string({ error: "Pick a password for guests." })
  .transform(normalizePassword)
  .pipe(
    z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(PASSWORD_MAX, `Keep it under ${PASSWORD_MAX} characters. It should be easy to say.`),
  );

export const createPartySchema = z.object({
  title: text(TITLE_MAX, "Give the party a name.", `Keep the name under ${TITLE_MAX} characters.`),
  // ISO instant from the browser (it converts the local date and time it was given).
  dateTime: z.iso.datetime({ offset: true, error: "Pick a date and time." }).transform((s) => new Date(s)),
  timeZone: z.string({ error: "Missing time zone." }).refine(isValidTimeZone, "Unknown time zone."),
  location: text(LOCATION_MAX, "Where is it?", `Keep the place under ${LOCATION_MAX} characters.`),
  address: text(ADDRESS_MAX, null, `Keep the address under ${ADDRESS_MAX} characters.`).default(""),
  // Notes keep their line breaks; only the ends are trimmed.
  notes: z
    .string({ error: "Invalid notes." })
    .transform((s) => s.trim())
    .pipe(z.string().max(NOTES_MAX, `Keep notes under ${NOTES_MAX} characters.`))
    .default(""),
  guestPassword,
  theme: z.enum(themeSlugs, { error: "Pick a theme." }).default(DEFAULT_THEME),
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;

export const unlockSchema = z.object({
  password: z.string({ error: "Enter the password." }).max(200, "That's not it.").transform(normalizePassword),
});
