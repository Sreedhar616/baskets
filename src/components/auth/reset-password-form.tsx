"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none focus:border-clay";

export function ResetPasswordForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl md:text-4xl">Choose a new password</h1>
        <p className="mt-2 text-center text-ink-soft">
          Enter a new password for your account.
        </p>

        {done ? (
          <div className="mt-6 rounded-xl bg-sage/15 px-4 py-4 text-center text-sm text-sage-dark">
            Password updated. Taking you to your account&hellip;
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              className={FIELD}
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              className={FIELD}
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !configured}
              className={cn(buttonClasses("primary", "lg"), "w-full")}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Update password
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link href="/login" className="text-clay hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
