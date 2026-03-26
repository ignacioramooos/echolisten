import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      // Let Supabase client process the tokens from the URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
        return;
      }

      // If this is a recovery flow, redirect to reset password page
      if (type === "recovery") {
        navigate("/reset-password");
        return;
      }

      if (!session) {
        navigate("/login");
        return;
      }

      const meta = session.user?.user_metadata || {};
      const role = meta.role;

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!existingProfile) {
        setStatus("Setting up your profile...");

        // Create profile from user_metadata stored during signup
        const { error: profileErr } = await supabase.from("profiles").insert({
          user_id: session.user.id,
          role: role || "seeker",
          first_name: meta.first_name || null,
          last_name: meta.last_name || null,
          country: meta.country || null,
          gender: meta.gender || null,
          username: meta.username || null,
          email: session.user.email,
          bio: meta.bio || null,
          topics_comfortable: meta.topics_comfortable || [],
          topics_avoid: meta.topics_avoid || [],
          topics_lived_experience: meta.topics_lived_experience || [],
          languages: meta.languages || [],
          verified_agreements: true,
        });

        if (profileErr) {
          console.error("Profile creation error:", profileErr);
        }

        // Init formation progress for listeners
        if (role === "listener") {
          await supabase.from("formation_progress").insert({
            user_id: session.user.id,
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
