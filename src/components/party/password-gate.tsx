"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { track } from "@/lib/track";

/** One question, one field. The page itself says nothing about the party until unlocked. */
export function PasswordGate({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const res = await api<{ ok: true }>(`/api/parties/${slug}/unlock`, { method: "POST", body: { password } });
    if (!res.ok) {
      track("party_unlocked", { outcome: res.status === 401 ? "wrong_password" : "error" });
      setError(res.error);
      setPending(false);
      return;
    }
    track("party_unlocked", { outcome: "ok" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field htmlFor="password" label="Password" error={error} hint="Your host told you this one. Capitals don't matter.">
        <Input
          id="password"
          variant="display"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="snowman"
          aria-invalid={Boolean(error)}
          aria-describedby="password-desc"
          autoFocus
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        block
        disabled={pending || !password.trim()}
        className="border-(--theme-accent) bg-(--theme-accent) text-(--theme-on-accent) hover:border-(--theme-accent) hover:bg-(--theme-accent) hover:opacity-85"
      >
        {pending ? "Checking" : "Let me in"}
      </Button>
    </form>
  );
}
