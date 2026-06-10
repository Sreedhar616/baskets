"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Mounted globally. When a password-reset link is opened, Supabase establishes
 * a recovery session (often after redirecting to the site root) and fires a
 * PASSWORD_RECOVERY event — we catch it and send the user to /reset-password.
 *
 * This makes password reset work even when the email's link lands on the home
 * page instead of the reset page, which is the most common misconfiguration.
 */
export function RecoveryListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    // Fallback: if the recovery token is present in the URL hash on load,
    // route to the reset page directly.
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("type=recovery") &&
      pathname !== "/reset-password"
    ) {
      router.push("/reset-password");
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/reset-password") {
        router.push("/reset-password");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
