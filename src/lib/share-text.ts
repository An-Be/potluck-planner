// "What's still needed" text the host can paste into the group chat.
// Pure; safe on client and server. Plain text, no markdown, so it reads the
// same in iMessage, WhatsApp and Slack.
import { CATEGORIES, formatQuantity, remaining, type NeedView } from "./needs";

export type ShareTextInput = {
  title: string;
  day: string;
  time: string;
  needs: readonly NeedView[];
  url: string;
};

export function buildShareText({ title, day, time, needs, url }: ShareTextInput): string {
  const header = `${title}, ${day} at ${time}`;
  if (needs.length === 0) return `${header}\n\nDetails and RSVP: ${url}`;

  const open = CATEGORIES.flatMap((c) => needs.filter((n) => n.category === c)).filter((n) => remaining(n) > 0);
  if (open.length === 0) return `${header}\n\nEverything on the list is covered. Thank you!\n\nWho's coming: ${url}`;

  const lines = open.map((n) => {
    const left = remaining(n);
    if (n.quantityNeeded === 1) return `- ${n.item}`;
    const claimed = n.quantityNeeded - left;
    return claimed === 0 ? `- ${n.item} (${formatQuantity(left, n.unit)})` : `- ${n.item} (${formatQuantity(left, n.unit)} more)`;
  });
  return `${header}\n\nStill needed:\n${lines.join("\n")}\n\nClaim something: ${url}`;
}
