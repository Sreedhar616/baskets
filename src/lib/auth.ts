import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  isAdmin: boolean;
}

/** Returns the logged-in user with profile info, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, is_admin")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? null,
      phone: profile?.phone ?? null,
      isAdmin: Boolean(profile?.is_admin),
    };
  } catch {
    return null;
  }
}

/** Returns the current user only if they are an admin, otherwise null. */
export async function getAdminUser(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}
