import { z } from "zod";
import { PARTY_SIZE_MAX, RSVP_STATUSES } from "./rsvp";

// Shared by the API route (validation) and the RSVP form (limits). Pure.
export const RSVP_NAME_MAX = 40;
export const RSVP_NOTE_MAX = 200;

const squish = (s: string) => s.trim().replace(/\s+/g, " ");

export const rsvpSchema = z.object({
  name: z
    .string({ error: "Add your name." })
    .transform(squish)
    .pipe(z.string().min(1, "Add your name.").max(RSVP_NAME_MAX, `Keep your name under ${RSVP_NAME_MAX} characters.`)),
  status: z.enum(RSVP_STATUSES, { error: "Pick coming, maybe or can't." }),
  partySize: z
    .number({ error: "How many of you?" })
    .int("How many of you?")
    .min(1, "How many of you?")
    .max(PARTY_SIZE_MAX, `Up to ${PARTY_SIZE_MAX}. Tell the host about bigger groups.`)
    .default(1),
  note: z
    .string({ error: "Invalid note." })
    .transform((s) => s.trim())
    .pipe(z.string().max(RSVP_NOTE_MAX, `Keep the note under ${RSVP_NOTE_MAX} characters.`))
    .transform((s) => (s ? s : null))
    .nullish()
    .transform((v) => v ?? null),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
