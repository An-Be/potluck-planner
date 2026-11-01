"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { copyToClipboard } from "@/lib/clipboard";
import { remaining, type NeedView } from "@/lib/needs";
import { buildShareText } from "@/lib/share-text";
import { track } from "@/lib/track";

const subscribeNoop = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Host only: the "still needed" list as text for the group chat. */
export function ShareNeeded({
  n,
  slug,
  title,
  day,
  time,
  needs,
}: {
  n: string;
  slug: string;
  title: string;
  day: string;
  time: string;
  needs: NeedView[];
}) {
  // The origin and the Web Share API only exist in the browser.
  const origin = useSyncExternalStore(subscribeNoop, () => window.location.origin, () => "");
  const nativeShare = useSyncExternalStore(subscribeNoop, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);
  const text = buildShareText({ title, day, time, needs, url: `${origin}/p/${slug}` });
  const itemsLeft = needs.filter((x) => remaining(x) > 0).length;

  async function copy() {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) {
      track("share_text_used", { method: "copy", items_left: itemsLeft });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function share() {
    try {
      await navigator.share({ text });
      track("share_text_used", { method: "share", items_left: itemsLeft });
    } catch {
      // Cancelled or unavailable: nothing to do.
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel n={n}>Nudge the group</SectionLabel>
      <p className="text-sm text-mute">Paste this in the group chat. It only lists what nobody has claimed yet.</p>
      <pre className="border border-ink bg-wash p-3 font-mono text-xs whitespace-pre-wrap break-words">{text}</pre>
      <div className="flex gap-3">
        <Button block onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy text"}
        </Button>
        {nativeShare ? (
          <Button variant="outline" block onClick={share}>
            Share
          </Button>
        ) : null}
      </div>
    </section>
  );
}
