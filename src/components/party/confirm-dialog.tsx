"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  run: () => Promise<void>;
};

/** Yes/no for anything that removes something another person added. */
export function ConfirmDialog({
  request,
  pending,
  onClose,
}: {
  request: ConfirmRequest | null;
  pending: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={request !== null} onClose={onClose} title={request?.title ?? ""} description={request?.description}>
      <div className="flex gap-3">
        <Button variant="outline" block onClick={onClose}>
          Cancel
        </Button>
        <Button block disabled={pending} onClick={() => request?.run()}>
          {pending ? "Removing" : request?.confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
