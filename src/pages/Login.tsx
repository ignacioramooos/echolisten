import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";
import { resolveUserRole, dashboardForRole } from "@/lib/resolve-role";
import { createProfileForRole } from "@/lib/profiles";
import GoogleSignInButton from "@/components/echo/GoogleSignInButton";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError("Authentication failed.");
      setLoading(false);
      return;
    }

    const role = await resolveUserRole(userId);

    if (role === "listener" || role === "seeker") {
      navigate(dashboardForRole(role));
      return;
    }

    // No profile — try creating one from metadata
    const meta = data.user?.user_metadata || {};
    if (meta.role === "seeker") {
      await createProfileForRole(data.user, "seeker", meta);
      navigate("/dashboard/seeker");
      return;
    }
    if (meta.role === "listener") {
      await createProfileForRole(data.user, "listener", meta);
      navigate("/dashboard/listener");
      return;
    }

    navigate("/onboarding", { replace: true });
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="font-display text-[36px] leading-tight text-foreground">{t("auth.welcomeBack")}</h1>

        <div className="mt-3 flex flex-col gap-2">
          <EchoInput
            label={t("auth.email")}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-0.5">
            <label className="font-body text-[12px] uppercase tracking-widest text-foreground">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-foreground bg-background px-1 py-1 pr-5 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 echo-fade"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} className="text-foreground" />
                ) : (
                  <Eye size={16} strokeWidth={1.5} className="text-foreground" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
          )}

          <EchoButton type="submit" variant="solid" size="md">
            {loading ? t("auth.loggingIn") : t("auth.loginButton")}
          </EchoButton>

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 border-t border-muted" />
            <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-muted" />
          </div>

          <GoogleSignInButton />

          <div className="flex flex-col items-center gap-0.5 mt-1">
            <p className="font-body text-[11px] text-muted-foreground">
              Need support?{" "}
              <Link to="/signup/seeker" className="text-foreground underline echo-fade">
                Create Seeker account
              </Link>
            </p>
            <p className="font-body text-[11px] text-muted-foreground">
              Want to listen?{" "}
              <Link to="/signup/listener" className="text-foreground underline echo-fade">
                Become a Listener
              </Link>
            </p>
            <p className="font-body text-[11px] text-muted-foreground">
              <Link to="/reset-password" className="text-foreground underline echo-fade">
                {t("auth.forgotPassword")}
              </Link>
            </p>
          </div>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;
