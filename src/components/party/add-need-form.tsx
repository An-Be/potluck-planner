"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { QUANTITY_MAX } from "@/lib/needs-schema";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { NeedFields, parseDraftQuantity, type NeedDraft } from "./need-fields";

const empty: Omit<NeedDraft, "category"> = { item: "", quantity: "1", unit: "", note: "" };

/** Host only. Keeps the type picked between adds, so a run of side dishes is quick. */
export function AddNeedForm({ slug }: { slug: string }) {
  const router = useRouter();
  const itemRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<NeedDraft>({ category: "FOOD", ...empty });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const qty = parseDraftQuantity(draft.quantity);
    if (qty === null) {
      setError(`How many? Use a number from 1 to ${QUANTITY_MAX}.`);
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ id: string }>(`/api/parties/${slug}/needs`, {
      method: "POST",
      body: { category: draft.category, item: draft.item, quantityNeeded: qty, unit: draft.unit, note: draft.note },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    track("need_added", {
      category: draft.category,
      quantity: qty,
      has_unit: Boolean(draft.unit.trim()),
      has_note: Boolean(draft.note.trim()),
    });
    toast(`Added ${draft.item.trim()}.`);
    setDraft((d) => ({ category: d.category, ...empty }));
    router.refresh();
    itemRef.current?.focus();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border border-ink bg-paper p-4" noValidate>
      <NeedFields idPrefix="need" value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} itemRef={itemRef} />
      {error ? (
        <p role="alert" className="border-2 border-ink p-3 text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" block disabled={pending || !draft.item.trim()}>
        {pending ? "Adding" : "Add to list"}
      </Button>
    </form>
  );
}
