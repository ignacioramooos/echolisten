import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";

interface Props {
  label?: string;
}

const GoogleSignInButton = ({ label = "Continue with Google" }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError("Google sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        return;
      }

      // Tokens received — resolve role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const role = await resolveUserRole(user.id);
      if (role === "listener" || role === "seeker") {
        navigate(dashboardForRole(role), { replace: true });
      } else {
        // New Google user — no profile yet, let them choose role
        navigate("/signup", { replace: true });
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full border border-foreground bg-background px-2 py-1 font-body text-[13px] text-foreground echo-fade hover:bg-foreground hover:text-background disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Connecting..." : label}
      </button>
      {error && (
        <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
