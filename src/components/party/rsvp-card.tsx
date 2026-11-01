"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { PARTY_SIZE_MAX, statusLabel, type AttendeeView, type RsvpStatus } from "@/lib/rsvp";
import { RSVP_NAME_MAX, RSVP_NOTE_MAX } from "@/lib/rsvp-schema";
import { readSavedName, saveName } from "@/lib/saved-name";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { accentButton } from "./accent-classes";
import { QuantityStepper } from "./quantity-stepper";
import { StatusPicker } from "./status-picker";

const subscribeNoop = () => () => {};

/** This device's RSVP: the answer with a Change button, or the form. */
export function RsvpCard({ slug, mine }: { slug: string; mine: AttendeeView | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(mine === null);
  // Name typed earlier on this device (claims or a past RSVP). Read through
  // useSyncExternalStore so the server render ("") and the client agree.
  const saved = useSyncExternalStore(subscribeNoop, readSavedName, () => "");
  const [name, setName] = useState<string | null>(null);
  const [status, setStatus] = useState<RsvpStatus | null>(mine?.status ?? null);
  const [size, setSize] = useState(mine?.partySize ?? 1);
  const [note, setNote] = useState(mine?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const nameValue = name ?? mine?.name ?? saved;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!status) {
      setError("Pick coming, maybe or can't.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ id: string }>(`/api/parties/${slug}/rsvps`, {
      method: "POST",
      body: { name: nameValue, status, partySize: status === "CANT" ? 1 : size, note },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    saveName(nameValue);
    track("rsvp_sent", { status, party_size: status === "CANT" ? 0 : size, changed: mine !== null });
    toast(status === "COMING" ? "See you there!" : status === "MAYBE" ? "Got it. Update it when you know." : "Thanks for letting them know.");
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!mine) return;
    setPending(true);
    const res = await api<{ ok: true }>(`/api/parties/${slug}/rsvps/${mine.id}`, { method: "DELETE" });
    setPending(false);
    if (!res.ok && res.status !== 404) {
      toast.error(res.error);
      return;
    }
    track("rsvp_removed", { by: "self" });
    setName(null);
    setStatus(null);
    setSize(1);
    setNote("");
    setEditing(true);
    router.refresh();
  }

  if (mine && !editing) {
    return (
      <div className="flex flex-col gap-3 border border-ink bg-paper p-4">
        <p className="label text-mute">Your RSVP</p>
        <p className="display text-3xl">
          {mine.status === "COMING"
            ? mine.partySize > 1
              ? `Coming, ${mine.partySize} of you`
              : "You're coming"
            : statusLabel(mine.status)}
        </p>
        <p className="text-sm">As {mine.name}</p>
        {mine.note ? <p className="text-sm whitespace-pre-line text-mute">{mine.note}</p> : null}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" className="px-3" onClick={() => setEditing(true)}>
            Change
          </Button>
          <Button variant="ghost" size="sm" className="h-auto px-0" disabled={pending} onClick={remove}>
            Remove RSVP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 border border-ink bg-paper p-4" noValidate>
      <Field htmlFor="rsvp-name" label="Your name">
        <Input
          id="rsvp-name"
          value={nameValue}
          onChange={(e) => setName(e.target.value)}
          maxLength={RSVP_NAME_MAX}
          autoComplete="given-name"
          placeholder="Ana"
        />
      </Field>
      <StatusPicker value={status} onChange={setStatus} />
      {status && status !== "CANT" ? (
        <div className="flex flex-col gap-2">
          <span id="rsvp-size-label" className="label">
            How many of you, including you
          </span>
          <QuantityStepper id="rsvp-size" value={size} max={PARTY_SIZE_MAX} onChange={setSize} />
        </div>
      ) : null}
      <Field htmlFor="rsvp-note" label="Note" hint="Optional. Running late, bringing the baby, allergies.">
        <Textarea
          id="rsvp-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={RSVP_NOTE_MAX}
          className="min-h-16"
          aria-describedby="rsvp-note-desc"
        />
      </Field>
      {error ? (
        <p role="alert" className="border-2 border-ink p-3 text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        {mine ? (
          <Button variant="outline" block onClick={() => setEditing(false)}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" block disabled={pending || !nameValue.trim() || !status} className={accentButton}>
          {pending ? "Sending" : mine ? "Save" : "Send RSVP"}
        </Button>
      </div>
    </form>
  );
}
