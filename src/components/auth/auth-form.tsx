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

        <form onSubmit={submit} className="mt-6 space-y-3">
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
