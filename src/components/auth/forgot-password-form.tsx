"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none focus:border-clay";

export function ForgotPasswordForm() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?next=/reset-password`
            : undefined,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl md:text-4xl">Reset your password</h1>
        <p className="mt-2 text-center text-ink-soft">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        {!configured && (
          <p className="mt-6 rounded-xl bg-sand px-4 py-3 text-sm text-ink-soft">
            Accounts aren&apos;t connected yet. Add your Supabase keys (see
            setup.md) to enable password reset.
          </p>
        )}

        {sent ? (
          <div className="mt-6 rounded-xl bg-sage/15 px-4 py-4 text-sm text-sage-dark">
            If an account exists for <strong>{email}</strong>, a reset link is on
            its way. Check your inbox (and spam folder), then follow the link to
            choose a new password.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              className={FIELD}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          Remembered it?{" "}
          <Link href="/login" className="text-clay hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
