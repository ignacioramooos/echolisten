import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";

type Role = "listener" | "seeker";

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email && password && role && agreed && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Show confirmation message — profile will be created in AuthCallback after email verification
    setLoading(false);
    setError("");
    // Navigate to a simple "check your email" state
    if (role === "listener") {
      navigate("/listener-signup");
    } else {
      navigate("/login");
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="font-display text-[36px] leading-tight text-foreground">{t("auth.joinEcho")}</h1>

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
                minLength={6}
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

          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[12px] uppercase tracking-widest text-foreground">
              {t("auth.selectRole")}
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setRole("listener")}
                className={`border border-foreground p-1 text-left echo-fade ${
                  role === "listener"
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground"
                }`}
              >
                <span className="font-display text-[18px] leading-tight block">{t("auth.roleListener")}</span>
                <span className="font-body text-[10px] mt-0.5 block opacity-80">
                  {t("auth.roleListenerDesc")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("seeker")}
                className={`border border-foreground p-1 text-left echo-fade ${
                  role === "seeker"
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground"
                }`}
              >
                <span className="font-display text-[18px] leading-tight block">{t("auth.roleSeeker")}</span>
                <span className="font-body text-[10px] mt-0.5 block opacity-80">
                  {t("auth.roleSeekerDesc")}
                </span>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-1 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-[3px] accent-foreground"
            />
            <span className="font-body text-[11px] text-foreground leading-tight">
              {t("signup.step5.checkPeerSupport")}
            </span>
          </label>

          {error && (
            <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
          )}

          <EchoButton
            type="submit"
            variant="solid"
            size="md"
            disabled={!canSubmit}
            className={!canSubmit ? "opacity-40 cursor-not-allowed" : ""}
          >
            {loading ? t("auth.signingUp") : t("auth.signUp")}
          </EchoButton>

          <p className="font-body text-[11px] text-muted-foreground text-center mt-1">
            {t("auth.alreadyHave")}{" "}
            <Link to="/login" className="text-foreground underline echo-fade">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Signup;
