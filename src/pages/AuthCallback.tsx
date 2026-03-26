import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

      // If this is a recovery flow, tokens are now processed; go reset password.
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

      const meta = user.user_metadata || {};
      const role = meta.role;

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        setStatus("Setting up your profile...");

        // Create profile from user_metadata stored during signup
        const { error: profileErr } = await supabase.from("profiles").insert({
          user_id: user.id,
          role: role || "seeker",
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
          console.error("Profile creation error:", profileErr);
          navigate("/login");
          return;
        }

        // Init formation progress for listeners
        if (role === "listener") {
          await supabase.from("formation_progress").insert({
            user_id: user.id,
            steps_completed: [],
            bot_passed: false,
          });
        }
      }

      // Redirect based on role
      if (role === "listener") {
        navigate("/formation");
      } else {
        navigate("/dashboard");
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
