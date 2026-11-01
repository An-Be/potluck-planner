"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { PASSWORD_MAX } from "@/lib/party-schema";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";
import { ConfirmDialog, type ConfirmRequest } from "./confirm-dialog";

/** New guest password, behind a confirm because it signs every guest out. */
export function ChangePasswordForm({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  async function change() {
    setPending(true);
    setError(null);
    const res = await api<{ ok: true }>(`/api/parties/${slug}/host/password`, {
      method: "POST",
      body: { guestPassword: password },
    });
    setPending(false);
    setConfirm(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    track("password_changed");
    toast("New password set. Tell your guests.");
    setPassword("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending || !password.trim()) return;
    setConfirm({
      title: "Change the password?",
      description: `Everyone who's already in will have to type “${password.trim().toLowerCase()}” next time they open the page. The link stays the same.`,
      confirmLabel: "Change it",
      run: change,
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        htmlFor="new-password"
        label="New guest password"
        error={error}
        hint="Use this if the password got around. Guests already in get signed out."
      >
        <Input
          id="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={PASSWORD_MAX}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="reindeer"
          aria-invalid={Boolean(error)}
          aria-describedby="new-password-desc"
        />
      </Field>
      <Button type="submit" variant="outline" block disabled={pending || !password.trim()}>
        Change password
      </Button>
      <ConfirmDialog request={confirm} pending={pending} onClose={() => setConfirm(null)} />
    </form>
  );
}
