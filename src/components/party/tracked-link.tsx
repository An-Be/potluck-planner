"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type TrackProps } from "@/lib/track";

/**
 * A plain <a> that records one analytics event when clicked. For downloads
 * and links that leave the app, where next/link doesn't apply.
 */
export function TrackedLink({
  event,
  props,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; props?: TrackProps; children: ReactNode }) {
  return (
    <a {...rest} onClick={() => track(event, props)}>
      {children}
    </a>
  );
}
