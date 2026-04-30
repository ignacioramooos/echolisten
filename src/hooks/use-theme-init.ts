import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

async function applyThemeForUser(userId: string) {
  // Try listener_profiles first
  const { data: lp } = await (supabase as any)
    .from("listener_profiles")
    .select("theme")
    .eq("user_id", userId)
    .maybeSingle();
  if (lp) {
    document.documentElement.setAttribute("data-theme", lp.theme || "light");
    return;
  }
  // Fall back to seeker_profiles
  const { data: sp } = await (supabase as any)
    .from("seeker_profiles")
    .select("theme")
    .eq("user_id", userId)
    .maybeSingle();
  document.documentElement.setAttribute("data-theme", sp?.theme || "light");
}

export function useThemeInit() {
  useEffect(() => {
    const apply = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await applyThemeForUser(session.user.id);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    };
    apply();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        applyThemeForUser(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
}
