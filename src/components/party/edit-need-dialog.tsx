"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { claimedCount, type NeedView } from "@/lib/needs";
import { QUANTITY_MAX } from "@/lib/needs-schema";
import { NeedFields, parseDraftQuantity, type NeedDraft } from "./need-fields";

export type NeedEdit = { category: NeedDraft["category"]; item: string; quantityNeeded: number; unit: string; note: string };

/**
 * Host edit of one item. The board remounts this per item (key = need id), so
 * the form starts from that item's saved values with no reset effect.
 */
export function EditNeedDialog({
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
  onSubmit: (edit: NeedEdit) => void;
}) {
  const [draft, setDraft] = useState<NeedDraft>(() => ({
    category: need?.category ?? "FOOD",
    item: need?.item ?? "",
    quantity: String(need?.quantityNeeded ?? 1),
    unit: need?.unit ?? "",
    note: need?.note ?? "",
  }));
  const [localError, setLocalError] = useState<string | null>(null);
  const claimed = need ? claimedCount(need) : 0;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const qty = parseDraftQuantity(draft.quantity);
    if (qty === null) {
      setLocalError(`How many? Use a number from 1 to ${QUANTITY_MAX}.`);
      return;
    }
    if (qty < claimed) {
      setLocalError(`Guests already claimed ${claimed}. Set it to ${claimed} or more, or remove a claim first.`);
      return;
    }
    setLocalError(null);
    onSubmit({ category: draft.category, item: draft.item, quantityNeeded: qty, unit: draft.unit, note: draft.note });
  }

  const shown = localError ?? error;
  return (
    <Dialog open={need !== null} onClose={onClose} title={need ? `Edit ${need.item}` : ""}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <NeedFields
          idPrefix="edit-need"
          value={draft}
          onChange={(p) => setDraft((d) => ({ ...d, ...p }))}
          quantityHint={claimed > 0 ? `${claimed} already claimed, so it can't go below ${claimed}.` : undefined}
        />
        {shown ? (
          <p role="alert" className="border-2 border-ink p-3 text-sm">
            {shown}
          </p>
        ) : null}
        <div className="flex gap-3">
          <Button variant="outline" block onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" block disabled={pending || !draft.item.trim()}>
            {pending ? "Saving" : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
