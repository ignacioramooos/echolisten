import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";

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
        const { error: profileErr } = await (supabase as any).from("listener_profiles").insert({
          user_id: user.id,
          role: "listener",
          first_name: meta.first_name || null,
          last_name: meta.last_name || null,
          country: meta.country || null,
          gender: meta.gender || null,
          username: meta.username || null,
          email: user.email,
          bio: meta.bio || null,
          topics_comfortable: meta.topics_comfortable || [],
          topics_avoid: meta.topics_avoid || [],
          topics_lived_experience: meta.topics_lived_experience || [],
          languages: meta.languages || [],
          verified_agreements: true,
        });

        if (profileErr) {
          console.error("Listener profile creation error:", profileErr);
          navigate("/login");
          return;
        }

        // Init formation progress
        await supabase.from("formation_progress").insert({
          user_id: user.id,
          steps_completed: [],
          bot_passed: false,
        });

        navigate("/dashboard/listener");
      } else if (role === "seeker") {
        const { error: profileErr } = await (supabase as any).from("seeker_profiles").insert({
          user_id: user.id,
          username: meta.username || null,
          email: user.email,
        });

        if (profileErr) {
          console.error("Seeker profile creation error:", profileErr);
          navigate("/login");
          return;
        }
        navigate("/dashboard/seeker");
      } else {
        // No role in metadata (e.g. Google OAuth user) — send to role selection
        navigate("/signup");
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
