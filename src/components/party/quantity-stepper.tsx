"use client";

import { Button } from "@/components/ui/button";

/** − n + for small counts. Bounded, so it can never ask for more than is left. */
export function QuantityStepper({
  id,
  value,
  min = 1,
  max,
  onChange,
}: {
  id: string;
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-stretch" role="group" aria-labelledby={`${id}-label`}>
      <Button variant="outline" size="icon" aria-label="One fewer" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </Button>
      <output id={id} aria-live="polite" className="display flex h-11 min-w-16 items-center justify-center border-y border-ink bg-paper px-3 text-2xl">
        {value}
      </output>
      <Button variant="outline" size="icon" aria-label="One more" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  );
}
