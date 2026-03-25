import { createClient } from "./server";

/**
 * Returns the authenticated user's ID if they are an admin, null otherwise.
 * Use in API routes to protect admin endpoints.
 */
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return data ? user.id : null;
}
