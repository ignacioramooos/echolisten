import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";
import { createProfileForRole } from "@/lib/profiles";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleCallback = async () => {
      setStatus("Processing...");

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      const type = hashParams.get("type") ?? searchParams.get("type");

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Auth code exchange error:", exchangeError);
          navigate("/login");
          return;
        }
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) {
          console.error("Auth setSession error:", setSessionError);
          navigate("/login");
          return;
        }
      }

      if (type === "recovery") {
        navigate("/reset-password");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Auth callback user error:", userError);
        navigate("/login");
        return;
      }

      // Check existing role from profile tables
      const existingRole = await resolveUserRole(user.id);

      if (existingRole === "listener" || existingRole === "seeker") {
        navigate(dashboardForRole(existingRole));
        return;
      }

      // No profile yet — create one based on signup metadata
      const meta = user.user_metadata || {};
      const role = meta.role;
      setStatus("Setting up your profile...");

      if (role === "listener") {
        try {
          await createProfileForRole(user, "listener", meta);
        } catch (profileErr) {
          console.error("Listener profile creation error:", profileErr);
          navigate("/login");
          return;
        }

        navigate("/dashboard/listener");
      } else if (role === "seeker") {
        try {
          await createProfileForRole(user, "seeker", meta);
        } catch (profileErr) {
          console.error("Seeker profile creation error:", profileErr);
          navigate("/login");
          return;
        }
        navigate("/dashboard/seeker");
      } else {
        // No role in metadata (e.g. Google OAuth user) — send to role selection
        navigate("/onboarding");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-body text-[13px] text-foreground">{status}</p>
    </div>
  );
};

export default AuthCallback;
