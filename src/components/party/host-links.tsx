"use client";

import { useSyncExternalStore } from "react";
import { CopyField } from "@/components/ui/copy-field";
import { SectionLabel } from "@/components/ui/section-label";

const subscribeNoop = () => () => {};

/** The two links a host needs: one to share, one to keep. */
export function HostLinks({ slug, hostToken }: { slug: string; hostToken: string }) {
  // The origin is only known in the browser; render a path on the server.
  const origin = useSyncExternalStore(subscribeNoop, () => window.location.origin, () => "");
  return (
    <>
      <section>
        <SectionLabel n="01">Share with guests</SectionLabel>
        <CopyField value={`${origin}/p/${slug}`} />
        <p className="mt-3 text-xs text-mute">
          Send this link and tell guests the password you picked. For safety we only keep a scrambled copy of the
          password, so we can&apos;t show it here.
        </p>
      </section>
      <section>
        <SectionLabel n="02">Your host link</SectionLabel>
        <CopyField value={`${origin}/h/${hostToken}`} />
        <p className="mt-3 text-xs text-mute">
          Save this somewhere safe. It&apos;s the only way back to the host view on another device, and anyone who has
          it can host. Don&apos;t share it with guests.
        </p>
      </section>
    </>
  );
}
