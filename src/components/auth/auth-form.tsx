"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-border bg-cream px-4 py-3 text-sm outline-none focus:border-clay";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const configured = isSupabaseConfigured();

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name, phone: form.phone },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
                : undefined,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setInfo("Check your email to confirm your account, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (error) throw error;
      // On success the browser is redirected to Google; nothing more to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl md:text-4xl">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-center text-ink-soft">
          {mode === "signup"
            ? "Sign up to check out faster and track your orders."
            : "Sign in to your D's Designs account."}
        </p>

        {!configured && (
          <p className="mt-6 rounded-xl bg-sand px-4 py-3 text-sm text-ink-soft">
            Accounts aren&apos;t connected yet. Add your Supabase keys (see
            setup.md) to enable sign in. You can still shop and check out as a
            guest.
          </p>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading || !configured}
          className={cn(
            buttonClasses("outline", "lg"),
            "mt-6 w-full normal-case tracking-normal"
          )}
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-ink-soft">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input className={FIELD} placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          )}
          <input className={FIELD} type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          {mode === "signup" && (
            <input className={FIELD} placeholder="Phone (optional)" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          )}
          <input className={FIELD} type="password" placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />

          {mode === "login" && (
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-clay hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>}
          {info && <p className="rounded-lg bg-sage/15 px-3 py-2 text-sm text-sage-dark">{info}</p>}

          <button type="submit" disabled={loading || !configured} className={cn(buttonClasses("primary", "lg"), "w-full")}>
            {loading && <Loader2 className="animate-spin" size={18} />}
            {mode === "signup" ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {mode === "signup" ? (
            <>Already have an account? <Link href="/login" className="text-clay hover:underline">Sign in</Link></>
          ) : (
            <>New here? <Link href="/signup" className="text-clay hover:underline">Create an account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}

/** Google "G" logo for the OAuth button. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
