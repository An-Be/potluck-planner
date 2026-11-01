"use client";

import { RSVP_STATUSES, statusLabel, type RsvpStatus } from "@/lib/rsvp";
import { cn } from "@/lib/utils";

/** Coming / Maybe / Can't as one row of radio buttons. */
export function StatusPicker({ value, onChange }: { value: RsvpStatus | null; onChange: (s: RsvpStatus) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label mb-2">Are you coming?</legend>
      <div className="grid grid-cols-3">
        {RSVP_STATUSES.map((s, i) => {
          const checked = s === value;
          return (
            <label
              key={s}
              className={cn(
                "flex h-11 items-center justify-center border border-ink text-center font-mono text-[12px] tracking-[0.14em] uppercase has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                i > 0 && "border-l-0",
                checked ? "bg-(--theme-accent) text-(--theme-on-accent)" : "bg-paper hover:bg-wash",
              )}
            >
              <input type="radio" name="rsvp-status" value={s} checked={checked} onChange={() => onChange(s)} className="sr-only" />
              {s === "CANT" ? "Can't" : statusLabel(s)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
