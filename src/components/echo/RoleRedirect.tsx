import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const RoleRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

      const { data: listener } = await supabase
        .from("listener_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (listener) { navigate("/dashboard/listener", { replace: true }); return; }

      const { data: seeker } = await supabase
        .from("seeker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (seeker) { navigate("/dashboard/seeker", { replace: true }); return; }

      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    };
    resolve();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-body text-[13px] text-muted-foreground">Loading…</p>
    </div>
  );
};

export default RoleRedirect;
