/**
 * Centralised access to environment variables with safe fallbacks.
 *
 * The site is designed to run BEFORE Supabase/Razorpay are connected:
 * when keys are absent (or still placeholders) the app falls back to local
 * sample data and disables online payment. Fill .env.local to go live.
 */

const PLACEHOLDERS = new Set([
  "",
  "your-anon-key",
  "your-service-role-key",
  "https://your-project-ref.supabase.co",
  "rzp_test_xxxxxxxx",
  "your-razorpay-secret",
  "your-webhook-secret",
  "your-resend-api-key",
]);

function clean(v: string | undefined): string {
  const t = (v ?? "").trim();
  return PLACEHOLDERS.has(t) ? "" : t;
}

export const env = {
  supabaseUrl: clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceKey: clean(process.env.SUPABASE_SERVICE_ROLE_KEY),

  razorpayKeyId: clean(process.env.RAZORPAY_KEY_ID),
  razorpayKeySecret: clean(process.env.RAZORPAY_KEY_SECRET),
  razorpayWebhookSecret: clean(process.env.RAZORPAY_WEBHOOK_SECRET),
  razorpayPublicKeyId: clean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),

  resendApiKey: clean(process.env.RESEND_API_KEY),
  orderFromEmail: clean(process.env.ORDER_FROM_EMAIL),
  ownerAlertEmail: clean(process.env.OWNER_ALERT_EMAIL),

  siteUrl: clean(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
};

/** True when public Supabase credentials look real (not placeholders). */
export function isSupabaseConfigured(): boolean {
  return (
    env.supabaseUrl.startsWith("https://") &&
    env.supabaseUrl.includes(".supabase.co") &&
    env.supabaseAnonKey.length > 20
  );
}

/** True when the server-only service role key is available. */
export function hasServiceRole(): boolean {
  return isSupabaseConfigured() && env.supabaseServiceKey.length > 20;
}

/** True when Razorpay server keys are present (online payments possible). */
export function isRazorpayConfigured(): boolean {
  return env.razorpayKeyId.length > 0 && env.razorpayKeySecret.length > 0;
}

/** True when Resend is configured (order emails can be sent). */
export function isResendConfigured(): boolean {
  return env.resendApiKey.length > 0 && env.orderFromEmail.length > 0;
}
