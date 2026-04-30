import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";
import { createProfileForRole } from "@/lib/profiles";

const RoleRedirect = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading">("loading");

  useEffect(() => {
    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

      const role = await resolveUserRole(user.id);

      if (role === "both") {
        navigate("/onboarding", { replace: true });
        return;
      }

      if (role === "listener" || role === "seeker") {
        navigate(dashboardForRole(role), { replace: true });
        return;
      }

      // role === "none" — try auto-repair from metadata
      const meta = user.user_metadata || {};

      if (meta.role === "listener") {
        try {
          await createProfileForRole(user, "listener", meta);
          navigate("/dashboard/listener", { replace: true });
          return;
        } catch (error) {
          console.error("Failed to repair listener profile:", error);
        }
      }

      if (meta.role === "seeker") {
        try {
          await createProfileForRole(user, "seeker", meta);
          navigate("/dashboard/seeker", { replace: true });
          return;
        } catch (error) {
          console.error("Failed to repair seeker profile:", error);
        }
      }

      navigate("/onboarding", { replace: true });
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
