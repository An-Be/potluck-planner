"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, inputVariants } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { CATEGORIES, categoryLabel, type Category } from "@/lib/needs";
import { ITEM_MAX, NEED_NOTE_MAX, QUANTITY_MAX, UNIT_MAX } from "@/lib/needs-schema";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/** Host only. Keeps the type picked between adds, so a run of side dishes is quick. */
export function AddNeedForm({ slug }: { slug: string }) {
  const router = useRouter();
  const itemRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<Category>("FOOD");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const qty = Number.parseInt(quantity, 10);
  const qtyOk = Number.isInteger(qty) && qty >= 1 && qty <= QUANTITY_MAX;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!qtyOk) {
      setError(`How many? Use a number from 1 to ${QUANTITY_MAX}.`);
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ id: string }>(`/api/parties/${slug}/needs`, {
      method: "POST",
      body: { category, item, quantityNeeded: qty, unit, note },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    track("need_added", { category, quantity: qty, has_unit: Boolean(unit.trim()), has_note: Boolean(note.trim()) });
    toast(`Added ${item.trim()}.`);
    setItem("");
    setQuantity("1");
    setUnit("");
    setNote("");
    router.refresh();
    itemRef.current?.focus();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border border-ink bg-paper p-4" noValidate>
      <Field htmlFor="need-item" label="Item">
        <Input
          ref={itemRef}
          id="need-item"
          variant="display"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          maxLength={ITEM_MAX}
          autoComplete="off"
          placeholder="Plates"
        />
      </Field>
      <div className="grid grid-cols-[1fr_5rem] gap-3">
        <Field htmlFor="need-category" label="Type">
          <div className="relative">
            <select
              id="need-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={cn(inputVariants(), "appearance-none")}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
              ▾
            </span>
          </div>
        </Field>
        <Field htmlFor="need-qty" label="How many">
          <Input
            id="need-qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={QUANTITY_MAX}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            aria-invalid={!qtyOk}
          />
        </Field>
      </div>
      <Field htmlFor="need-unit" label="Unit" hint="Optional. Bags, bottles, dozen.">
        <Input
          id="need-unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          maxLength={UNIT_MAX}
          autoComplete="off"
          aria-describedby="need-unit-desc"
        />
      </Field>
      <Field htmlFor="need-note" label="Note" hint="Optional. Nut-free, serves 10, any brand.">
        <Input
          id="need-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={NEED_NOTE_MAX}
          autoComplete="off"
          aria-describedby="need-note-desc"
        />
      </Field>
      {error ? (
        <p role="alert" className="border-2 border-ink p-3 text-sm">
          {error}
        </p>
      ) : null}
      <Button type="submit" block disabled={pending || !item.trim()}>
        {pending ? "Adding" : "Add to list"}
      </Button>
    </form>
  );
}
