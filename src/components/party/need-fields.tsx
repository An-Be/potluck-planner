"use client";

import type { Ref } from "react";
import { Field } from "@/components/ui/field";
import { Input, inputVariants } from "@/components/ui/input";
import { CATEGORIES, categoryLabel, type Category } from "@/lib/needs";
import { ITEM_MAX, NEED_NOTE_MAX, QUANTITY_MAX, UNIT_MAX } from "@/lib/needs-schema";
import { cn } from "@/lib/utils";

/** What the item form holds. Quantity stays a string while typing. */
export type NeedDraft = { category: Category; item: string; quantity: string; unit: string; note: string };

export function parseDraftQuantity(q: string): number | null {
  const n = Number.parseInt(q, 10);
  return Number.isInteger(n) && n >= 1 && n <= QUANTITY_MAX ? n : null;
}

/**
 * The item fields shared by "Add to list" and the edit dialog, so both stay
 * the same. `idPrefix` keeps label/input ids unique when both are on a page.
 */
export function NeedFields({
  idPrefix,
  value,
  onChange,
  itemRef,
  quantityHint,
}: {
  idPrefix: string;
  value: NeedDraft;
  onChange: (patch: Partial<NeedDraft>) => void;
  itemRef?: Ref<HTMLInputElement>;
  quantityHint?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const qtyOk = parseDraftQuantity(value.quantity) !== null;
  return (
    <>
      <Field htmlFor={id("item")} label="Item">
        <Input
          ref={itemRef}
          id={id("item")}
          variant="display"
          value={value.item}
          onChange={(e) => onChange({ item: e.target.value })}
          maxLength={ITEM_MAX}
          autoComplete="off"
          placeholder="Plates"
        />
      </Field>
      <div className="grid grid-cols-[1fr_5rem] gap-3">
        <Field htmlFor={id("category")} label="Type">
          <div className="relative">
            <select
              id={id("category")}
              value={value.category}
              onChange={(e) => onChange({ category: e.target.value as Category })}
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
        <Field htmlFor={id("qty")} label="How many">
          <Input
            id={id("qty")}
            type="number"
            inputMode="numeric"
            min={1}
            max={QUANTITY_MAX}
            value={value.quantity}
            onChange={(e) => onChange({ quantity: e.target.value })}
            aria-invalid={!qtyOk}
            aria-describedby={quantityHint ? id("qty-hint") : undefined}
          />
        </Field>
      </div>
      {quantityHint ? (
        <p id={id("qty-hint")} className="-mt-2 text-xs text-mute">
          {quantityHint}
        </p>
      ) : null}
      <Field htmlFor={id("unit")} label="Unit" hint="Optional. Bags, bottles, dozen.">
        <Input
          id={id("unit")}
          value={value.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          maxLength={UNIT_MAX}
          autoComplete="off"
          aria-describedby={`${id("unit")}-desc`}
        />
      </Field>
      <Field htmlFor={id("note")} label="Note" hint="Optional. Nut-free, serves 10, any brand.">
        <Input
          id={id("note")}
          value={value.note}
          onChange={(e) => onChange({ note: e.target.value })}
          maxLength={NEED_NOTE_MAX}
          autoComplete="off"
          aria-describedby={`${id("note")}-desc`}
        />
      </Field>
    </>
  );
}
