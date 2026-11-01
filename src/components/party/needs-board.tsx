"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { groupNeeds, type ClaimView, type NeedView } from "@/lib/needs";
import { saveName } from "@/lib/saved-name";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { ClaimDialog, type ClaimDraft } from "./claim-dialog";
import { ConfirmDialog, type ConfirmRequest } from "./confirm-dialog";
import { NeedRow } from "./need-row";

/**
 * The needs list, grouped by type. Data comes from the server page; after any
 * change we router.refresh() so counts and names come back from the database,
 * never from optimistic guesses.
 */
export function NeedsBoard({ slug, needs, isHost }: { slug: string; needs: NeedView[]; isHost: boolean }) {
  const router = useRouter();
  const [claimForId, setClaimForId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [pending, setPending] = useState(false);

  // Derived from the latest props, so a refresh while the dialog is open
  // updates what's left.
  const claimFor = needs.find((n) => n.id === claimForId) ?? null;
  const groups = groupNeeds(needs);

  function openClaim(need: NeedView) {
    setClaimError(null);
    setClaimForId(need.id);
  }

  async function submitClaim(draft: ClaimDraft) {
    if (!claimFor || pending) return;
    setPending(true);
    setClaimError(null);
    const res = await api<{ id: string; remaining: number }>(`/api/parties/${slug}/claims`, {
      method: "POST",
      body: { needId: claimFor.id, name: draft.name, quantity: draft.quantity, note: draft.note },
    });
    setPending(false);
    if (!res.ok) {
      if (res.status === 409) {
        track("item_claimed", { outcome: "conflict" });
        router.refresh();
        const left = res.body && typeof res.body === "object" && "remaining" in res.body ? Number(res.body.remaining) : 0;
        if (left === 0) {
          setClaimForId(null);
          toast.error(res.error);
          return;
        }
      }
      if (res.status === 404) {
        setClaimForId(null);
        toast.error("That item was just removed.");
        router.refresh();
        return;
      }
      setClaimError(res.error);
      return;
    }
    saveName(draft.name);
    track("item_claimed", { outcome: "ok", quantity: draft.quantity, filled: res.data.remaining === 0 });
    toast(`Got it. ${claimFor.item} is on you.`);
    setClaimForId(null);
    router.refresh();
  }

  async function removeClaim(claim: ClaimView) {
    setPending(true);
    const res = await api<{ ok: true }>(`/api/parties/${slug}/claims/${claim.id}`, { method: "DELETE" });
    setPending(false);
    setConfirm(null);
    if (!res.ok && res.status !== 404) {
      toast.error(res.error);
      return;
    }
    track("claim_removed", { by: claim.mine ? "self" : "host" });
    toast(claim.mine ? "Removed. Someone else can take it." : `Removed ${claim.name}'s claim.`);
    router.refresh();
  }

  function askRemoveClaim(need: NeedView, claim: ClaimView) {
    if (claim.mine) {
      void removeClaim(claim);
      return;
    }
    setConfirm({
      title: `Remove ${claim.name}?`,
      description: `${claim.name} won't be listed as bringing ${need.item} anymore. Let them know.`,
      confirmLabel: "Remove",
      run: () => removeClaim(claim),
    });
  }

  function askDeleteNeed(need: NeedView) {
    const people = need.claims.length;
    setConfirm({
      title: `Delete ${need.item}?`,
      description:
        people === 0
          ? "It comes off the list for everyone."
          : `${need.claims[0].name}${people > 1 ? ` and ${people - 1} other${people > 2 ? "s" : ""}` : ""} already said they'd bring it. Their claims go too, so let them know.`,
      confirmLabel: "Delete",
      run: async () => {
        setPending(true);
        const res = await api<{ ok: true }>(`/api/parties/${slug}/needs/${need.id}`, { method: "DELETE" });
        setPending(false);
        setConfirm(null);
        if (!res.ok && res.status !== 404) {
          toast.error(res.error);
          return;
        }
        track("need_deleted", { had_claims: people > 0 });
        router.refresh();
      },
    });
  }

  if (groups.length === 0) {
    return (
      <p className="border border-dashed border-ink bg-paper p-4 text-sm text-mute">
        {isHost
          ? "Nothing on the list yet. Add what you need above and guests will see it here, grouped by type."
          : "Nothing on the list yet. Your host is still deciding what's needed."}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.category}>
            <h3 className="label mb-2 text-mute">{g.label}</h3>
            <ul className="border border-ink bg-paper">
              {g.needs.map((need) => (
                <NeedRow
                  key={need.id}
                  need={need}
                  isHost={isHost}
                  busy={pending}
                  onBring={openClaim}
                  onRemoveClaim={askRemoveClaim}
                  onDelete={askDeleteNeed}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ClaimDialog
        key={claimFor?.id ?? "closed"}
        need={claimFor}
        error={claimError}
        pending={pending}
        onClose={() => setClaimForId(null)}
        onSubmit={submitClaim}
      />
      <ConfirmDialog request={confirm} pending={pending} onClose={() => setConfirm(null)} />
    </>
  );
}
