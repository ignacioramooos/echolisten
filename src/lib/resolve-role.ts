import { supabase } from "@/integrations/supabase/client";

export type UserRoleState = "listener" | "seeker" | "none" | "both";

/**
 * Resolve user role by querying profile tables (single source of truth).
 * Never relies on user_metadata.role for navigation decisions.
 */
export const resolveUserRole = async (userId: string): Promise<UserRoleState> => {
  const [{ data: listener }, { data: seeker }] = await Promise.all([
    supabase.from("listener_profiles").select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("seeker_profiles").select("id").eq("user_id", userId).maybeSingle(),
  ]);

  const hasListener = !!listener;
  const hasSeeker = !!seeker;

  if (hasListener && hasSeeker) return "both";
  if (hasListener) return "listener";
  if (hasSeeker) return "seeker";
  return "none";
};

/** Returns the dashboard path for the given role */
export const dashboardForRole = (role: UserRoleState): string => {
  if (role === "listener") return "/dashboard/listener";
  if (role === "seeker") return "/dashboard/seeker";
  return "/login";
};
