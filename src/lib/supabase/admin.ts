import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * Bypasses Row Level Security. Used exclusively in API routes to create orders
 * with server-authoritative pricing and to read/write admin-only data.
 *
 * NEVER import this into a Client Component — the `server-only` package above
 * makes such an import a build error so the service key can't leak to browsers.
 */
export function createAdminClient() {
  if (!env.supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
