"use client";

import { themes, type ThemeSlug } from "@/lib/themes";
import { cn } from "@/lib/utils";

/**
 * Radio cards, one per theme. Each card sits inside its own data-theme scope
 * (the page renders every theme's CSS), so the swatch shows the real colors.
 */
export function ThemePicker({ value, onChange }: { value: ThemeSlug; onChange: (slug: ThemeSlug) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label mb-2">Theme</legend>
      {themes.map((t) => {
        const checked = t.slug === value;
        return (
          <label
            key={t.slug}
            data-theme={t.slug}
            className={cn(
              "flex items-center gap-3 border border-ink bg-(--theme-tint) p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
              checked ? "border-2 p-[11px]" : "",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={t.slug}
              checked={checked}
              onChange={() => onChange(t.slug)}
              className="sr-only"
            />
            <span aria-hidden="true" className="flex shrink-0">
              <span className="size-6 border border-ink bg-(--theme-accent)" />
              <span className="size-6 border border-l-0 border-ink bg-(--theme-art)" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-base font-medium">
                {t.name} {t.emoji ? <span aria-hidden="true">{t.emoji}</span> : null}
              </span>
              <span className="text-xs text-mute">{t.blurb}</span>
            </span>
            <span className="label">{checked ? "Picked" : ""}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
