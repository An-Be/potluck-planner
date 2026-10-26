"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { localInputToIso } from "@/lib/party-format";
import { ADDRESS_MAX, LOCATION_MAX, NOTES_MAX, PASSWORD_MAX, TITLE_MAX } from "@/lib/party-schema";
import { DEFAULT_THEME, type ThemeSlug } from "@/lib/themes";
import { track } from "@/lib/track";
import { ThemePicker } from "./theme-picker";

export function CreatePartyForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<ThemeSlug>(DEFAULT_THEME);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ready = title.trim() && when && location.trim() && password.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const dateTime = localInputToIso(when);
    if (!dateTime) {
      setError("Pick a date and time.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ hostToken: string }>("/api/parties", {
      method: "POST",
      body: {
        title,
        dateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location,
        address,
        notes,
        guestPassword: password,
        theme,
      },
    });
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    track("party_created", { theme, has_address: Boolean(address.trim()), has_notes: Boolean(notes.trim()) });
    // The host link sets the host cookie and lands on the host page.
    router.push(`/h/${res.data.hostToken}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Field htmlFor="title" label="Party name">
        <Input
          id="title"
          variant="display"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          autoComplete="off"
          placeholder="Holiday party"
          required
        />
      </Field>
      <Field htmlFor="when" label="When">
        <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
      </Field>
      <Field htmlFor="location" label="Where">
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={LOCATION_MAX}
          autoComplete="off"
          placeholder="Our place"
          required
        />
      </Field>
      <Field htmlFor="address" label="Address" hint="Optional. Guests get a maps link.">
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={ADDRESS_MAX}
          autoComplete="off"
          placeholder="123 N State St, Chicago"
          aria-describedby="address-desc"
        />
      </Field>
      <Field htmlFor="notes" label="Notes" hint="Optional. Parking, dress code, the dog.">
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={NOTES_MAX}
          placeholder="Park on Elm. Ugly sweaters encouraged."
          aria-describedby="notes-desc"
        />
      </Field>
      <Field
        htmlFor="guest-password"
        label="Guest password"
        hint="One easy word you can say out loud. Guests type it once. Capitals don't matter."
      >
        <Input
          id="guest-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={PASSWORD_MAX}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="snowman"
          aria-describedby="guest-password-desc"
          required
        />
      </Field>
      <ThemePicker value={theme} onChange={setTheme} />
      {error ? (
        <p role="alert" className="border-2 border-ink p-3 text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending || !ready}>
        {pending ? "Creating" : "Create party page"}
      </Button>
    </form>
  );
}
