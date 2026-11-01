"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CLAIM_NOTE_MAX, NAME_MAX } from "@/lib/needs-schema";
import { remaining, type NeedView } from "@/lib/needs";
import { readSavedName } from "@/lib/saved-name";
import { accentButton } from "./accent-classes";
import { QuantityStepper } from "./quantity-stepper";

export type ClaimDraft = { name: string; quantity: number; note: string };

export function ClaimDialog({
  need,
  error,
  pending,
  onClose,
  onSubmit,
}: {
  need: NeedView | null;
  error: string | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (draft: ClaimDraft) => void;
}) {
  // The board remounts this per item (key = need id), so initial state is
  // per item and no reset effect is needed. Storage is only read once an item
  // is picked, which is always on the client.
  const [name, setName] = useState(() => (need ? readSavedName() : ""));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const left = need ? remaining(need) : 0;
  // Someone else may claim while the dialog is open: never offer more than is left.
  const qty = Math.max(1, Math.min(quantity, left));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (pending || !name.trim()) return;
    onSubmit({ name, quantity: qty, note });
  }

  return (
    <Dialog
      open={need !== null}
      onClose={onClose}
      title={need ? `Bring ${need.item}` : ""}
      description={
        need && need.quantityNeeded > 1
          ? `${left} of ${need.quantityNeeded} still needed${need.unit ? ` (${need.unit})` : ""}.`
          : (need?.note ?? undefined)
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field htmlFor="claim-name" label="Your name" error={error}>
          <Input
            id="claim-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            autoComplete="given-name"
            placeholder="Ana"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "claim-name-desc" : undefined}
          />
        </Field>
        {left > 1 ? (
          <div className="flex flex-col gap-2">
            <span id="claim-qty-label" className="label">
              How many{need?.unit ? ` (${need.unit})` : ""}
            </span>
            <QuantityStepper id="claim-qty" value={qty} max={left} onChange={setQuantity} />
          </div>
        ) : null}
        <Field htmlFor="claim-note" label="Note" hint="Optional. Like “my abuela's recipe” or “nut-free”.">
          <Input
            id="claim-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={CLAIM_NOTE_MAX}
            autoComplete="off"
            aria-describedby="claim-note-desc"
          />
        </Field>
        <Button type="submit" size="lg" block disabled={pending || !name.trim()} className={accentButton}>
          {pending ? "Saving" : "I'll bring it"}
        </Button>
      </form>
    </Dialog>
  );
}
