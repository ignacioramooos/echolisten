import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useThemeInit() {
  useEffect(() => {
    const apply = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        // Theme is only stored on listener_profiles
        const { data } = await supabase
          .from("listener_profiles" as any)
          .select("theme")
          .eq("user_id", session.user.id)
          .maybeSingle();
        document.documentElement.setAttribute("data-theme", (data as any)?.theme || "light");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    };
    apply();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        supabase
          .from("listener_profiles" as any)
          .select("theme")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            document.documentElement.setAttribute("data-theme", (data as any)?.theme || "light");
          });
      }
    });
    return () => subscription.unsubscribe();
  }, []);
}
