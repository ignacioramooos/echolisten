import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";

const RoleRedirect = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "no-role">("loading");

  useEffect(() => {
    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }

      const role = await resolveUserRole(user.id);

      if (role === "both") {
        console.error("User has both listener and seeker profiles");
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }

      if (role === "listener" || role === "seeker") {
        navigate(dashboardForRole(role), { replace: true });
        return;
      }

      // role === "none" — try auto-repair from metadata
      const meta = user.user_metadata || {};

      if (meta.role === "listener") {
        const { error } = await (supabase as any).from("listener_profiles").insert({
          user_id: user.id,
          role: "listener",
          email: user.email,
          username: meta.username || null,
          first_name: meta.first_name || null,
          last_name: meta.last_name || null,
        });
        if (!error) {
          await supabase.from("formation_progress").insert({
            user_id: user.id,
            steps_completed: [],
            bot_passed: false,
          });
          navigate("/dashboard/listener", { replace: true });
          return;
        }
        console.error("Failed to auto-repair listener profile:", error);
      }

      if (meta.role === "seeker") {
        const { error } = await (supabase as any).from("seeker_profiles").insert({
          user_id: user.id,
          username: meta.username || null,
          email: user.email,
        });
        if (!error) {
          navigate("/dashboard/seeker", { replace: true });
          return;
        }
        console.error("Failed to auto-repair seeker profile:", error);
      }

      // Can't determine or repair role — show fallback
      setStatus("no-role");
    };
    resolve();
  }, [navigate]);

  if (status === "no-role") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="font-display text-[24px] text-foreground">
            We couldn't find your account profile.
          </p>
          <p className="font-body text-[13px] text-muted-foreground mt-2">
            This can happen with older accounts. Please sign up again or contact support.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => navigate("/signup/seeker")}
              className="font-body text-[12px] border border-foreground px-3 py-1.5 text-foreground echo-fade"
            >
              Sign up as Seeker
            </button>
            <button
              onClick={() => navigate("/signup/listener")}
              className="font-body text-[12px] border border-foreground px-3 py-1.5 text-foreground echo-fade"
            >
              Sign up as Listener
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
              className="font-body text-[12px] text-muted-foreground underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-body text-[13px] text-muted-foreground">Loading…</p>
    </div>
  );
};

export default RoleRedirect;
