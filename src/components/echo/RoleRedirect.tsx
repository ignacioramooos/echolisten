import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";

const RoleRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

      const role = await resolveUserRole(user.id);

      if (role === "both") {
        // Conflict — sign out to prevent loops
        console.error("User has both listener and seeker profiles");
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }

      if (role === "none") {
        // No profile — try to auto-repair from metadata
        const meta = user.user_metadata || {};
        if (meta.role === "listener") {
          await (supabase as any).from("listener_profiles").insert({
            user_id: user.id,
            role: "listener",
            email: user.email,
            username: meta.username || null,
            first_name: meta.first_name || null,
            last_name: meta.last_name || null,
          });
          await supabase.from("formation_progress").insert({ user_id: user.id, steps_completed: [], bot_passed: false });
          navigate("/dashboard/listener", { replace: true });
          return;
        }
        if (meta.role === "seeker") {
          await (supabase as any).from("seeker_profiles").insert({
            user_id: user.id,
            username: meta.username || null,
            email: user.email,
          });
          navigate("/dashboard/seeker", { replace: true });
          return;
        }
        // Can't determine role
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }

      navigate(dashboardForRole(role), { replace: true });
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
