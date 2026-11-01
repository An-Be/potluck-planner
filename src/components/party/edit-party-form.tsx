"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { ADDRESS_MAX, LOCATION_MAX, NOTES_MAX, TITLE_MAX } from "@/lib/party-schema";
import type { ThemeSlug } from "@/lib/themes";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { ThemePicker } from "./theme-picker";

export type EditableParty = {
  slug: string;
  title: string;
  /** "YYYY-MM-DDTHH:mm" in the party's own time zone. */
  localDateTime: string;
  timeZone: string;
  location: string;
  address: string;
  notes: string;
  theme: ThemeSlug;
};

/** Host edit of details and theme. The link and password don't change here. */
export function EditPartyForm({ party }: { party: EditableParty }) {
  const router = useRouter();
  const [title, setTitle] = useState(party.title);
  const [when, setWhen] = useState(party.localDateTime);
  const [location, setLocation] = useState(party.location);
  const [address, setAddress] = useState(party.address);
  const [notes, setNotes] = useState(party.notes);
  const [theme, setTheme] = useState<ThemeSlug>(party.theme);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const res = await api<{ ok: true }>(`/api/parties/${party.slug}/host`, {
      method: "PATCH",
      body: { title, localDateTime: when, location, address, notes, theme },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    track("party_edited", {
      theme_changed: theme !== party.theme,
      time_changed: when !== party.localDateTime,
      theme,
    });
    toast("Saved. Everyone sees the update.");
    router.push(`/p/${party.slug}/host`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Field htmlFor="edit-title" label="Party name">
        <Input id="edit-title" variant="display" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX} autoComplete="off" />
      </Field>
      <Field htmlFor="edit-when" label="When" hint={`In the party's time zone (${party.timeZone.replace(/_/g, " ")}).`}>
        <Input id="edit-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} aria-describedby="edit-when-desc" />
      </Field>
      <Field htmlFor="edit-location" label="Where">
        <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={LOCATION_MAX} autoComplete="off" />
      </Field>
      <Field htmlFor="edit-address" label="Address" hint="Optional. Guests get a maps link.">
        <Input
          id="edit-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={ADDRESS_MAX}
          autoComplete="off"
          aria-describedby="edit-address-desc"
        />
      </Field>
      <Field htmlFor="edit-notes" label="Notes" hint="Optional. Parking, dress code, the dog.">
        <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={NOTES_MAX} aria-describedby="edit-notes-desc" />
      </Field>
      <ThemePicker value={theme} onChange={setTheme} />
      {error ? (
        <p role="alert" className="border-2 border-ink p-3 text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending || !title.trim() || !when || !location.trim()}>
        {pending ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}
