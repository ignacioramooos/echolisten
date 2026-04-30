import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppearanceState {
  bgUrl: string | null;
  bgIntensity: number;
  loading: boolean;
}

/**
 * Loads the current user's appearance settings (background image + intensity)
 * from whichever profile table they belong to (listener_profiles or seeker_profiles).
 */
export function useAppearance(): AppearanceState {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgIntensity, setBgIntensity] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Try listener_profiles first
      const { data: lp } = await (supabase as any)
        .from("listener_profiles")
        .select("chat_bg_url, chat_bg_intensity")
        .eq("user_id", user.id)
        .maybeSingle();

      if (lp) {
        setBgUrl(lp.chat_bg_url || null);
        setBgIntensity(lp.chat_bg_intensity ?? 20);
        setLoading(false);
        return;
      }

      // Fall back to seeker_profiles
      const { data: sp } = await (supabase as any)
        .from("seeker_profiles")
        .select("chat_bg_url, chat_bg_intensity")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sp) {
        setBgUrl(sp.chat_bg_url || null);
        setBgIntensity(sp.chat_bg_intensity ?? 20);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { bgUrl, bgIntensity, loading };
}
