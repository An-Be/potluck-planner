"use client";

import { Button } from "@/components/ui/button";
import { claimedCount, formatQuantity, remaining, type ClaimView, type NeedView } from "@/lib/needs";
import { cn } from "@/lib/utils";
import { accentButton } from "./accent-classes";

type Props = {
  need: NeedView;
  isHost: boolean;
  busy: boolean;
  onBring: (need: NeedView) => void;
  onRemoveClaim: (need: NeedView, claim: ClaimView) => void;
  onEdit: (need: NeedView) => void;
  onDelete: (need: NeedView) => void;
};

/** One item: what it is, claimed/needed, who's bringing it, and what you can do about it. */
export function NeedRow({ need, isHost, busy, onBring, onRemoveClaim, onEdit, onDelete }: Props) {
  const claimed = claimedCount(need);
  const left = remaining(need);
  const covered = left === 0;
  const showCounts = need.quantityNeeded > 1;

  return (
    <li className="flex flex-col gap-3 border-b border-ink p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className={cn("font-display text-lg font-medium break-words", covered && "text-mute line-through decoration-1")}>
            {need.item}
          </p>
          {need.note ? <p className="text-xs break-words text-mute">{need.note}</p> : null}
        </div>
        <p className={cn("label shrink-0 pt-1", covered ? "text-(--theme-accent)" : "text-ink")}>
          {covered ? "Covered" : `${claimed}/${formatQuantity(need.quantityNeeded, need.unit)}`}
        </p>
      </div>

      {need.claims.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {need.claims.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 break-words">
                {c.name}
                {showCounts ? <span className="text-mute"> × {c.quantity}</span> : null}
                {c.mine ? <span className="label ml-2 text-mute">You</span> : null}
                {c.note ? <span className="block text-xs text-mute">“{c.note}”</span> : null}
              </span>
              {c.mine || isHost ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto shrink-0 px-0"
                  disabled={busy}
                  onClick={() => onRemoveClaim(need, c)}
                  aria-label={c.mine ? `Remove your claim on ${need.item}` : `Remove ${c.name}'s claim on ${need.item}`}
                >
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!covered || isHost ? (
        <div className="flex items-center justify-between gap-3">
          {!covered ? (
            <Button size="sm" className={cn(accentButton, "px-3")} disabled={busy} onClick={() => onBring(need)}>
              {need.claims.length === 0 ? "I'll bring it" : `Bring ${showCounts ? "some" : "it"}`}
            </Button>
          ) : (
            <span />
          )}
          {isHost ? (
            <span className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-0"
                disabled={busy}
                onClick={() => onEdit(need)}
                aria-label={`Edit ${need.item}`}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-0"
                disabled={busy}
                onClick={() => onDelete(need)}
                aria-label={`Delete ${need.item}`}
              >
                Delete
              </Button>
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
