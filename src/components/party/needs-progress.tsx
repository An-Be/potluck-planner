import { summarize, type NeedView } from "@/lib/needs";

/** "3 of 7 covered" with a bar. A native <progress>: no inline width style, which the CSP would block. */
export function NeedsProgress({ needs }: { needs: readonly NeedView[] }) {
  const { covered, total } = summarize(needs);
  if (total === 0) return null;
  const done = covered === total;
  return (
    <div className="flex flex-col gap-2">
      <p className="display text-3xl">
        {done ? "All covered" : `${covered} of ${total} covered`}
      </p>
      <progress
        value={covered}
        max={total}
        aria-label={`${covered} of ${total} items covered`}
        className="h-2 w-full appearance-none border border-ink bg-paper [&::-moz-progress-bar]:bg-(--theme-accent) [&::-webkit-progress-bar]:bg-paper [&::-webkit-progress-value]:bg-(--theme-accent)"
      />
      <p className="text-xs text-mute">
        {done ? "Everything on the list has someone bringing it." : `${total - covered} still need someone. Tap one to bring it.`}
      </p>
    </div>
  );
}
