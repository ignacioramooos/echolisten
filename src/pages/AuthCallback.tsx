import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      // Let Supabase client auto-detect and process the tokens from the URL
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

      // For email confirmation, redirect based on role
      if (session) {
        const role = session.user?.user_metadata?.role;
        if (role === "listener") {
          navigate("/formation");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="font-body text-[13px] text-foreground">Processing...</p>
    </div>
  );
};

export default AuthCallback;
