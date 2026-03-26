import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useThemeInit() {
  useEffect(() => {
    const apply = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase
          .from("profiles")
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
          .from("profiles")
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
