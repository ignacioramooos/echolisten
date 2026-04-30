import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createProfileForRole } from "@/lib/profiles";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import GoogleSignInButton from "@/components/echo/GoogleSignInButton";

const HCAPTCHA_SITE_KEY = "b522d150-2c12-4678-bbc6-82bee8fce844";

const SeekerSignup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const captchaRef = useRef<HCaptcha>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [crisisConfirm, setCrisisConfirm] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [captchaFailed, setCaptchaFailed] = useState(false);

  // Force Supabase auth on mount
  useEffect(() => {
    const confirmSupabaseIsActive = async () => {
      const session = await supabase.auth.getSession();
      console.log('[SeekerSignup] Supabase session check:', session.data.session ? 'authenticated' : 'not authenticated');
    };
    confirmSupabaseIsActive();
  }, []);

  const canSubmit = username.trim() && email && password.length >= 6 && captchaToken && crisisConfirm && termsAgreed && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    // Check username uniqueness
    const { data: available } = await supabase.rpc("check_username_available", {
      desired_username: username.trim(),
    });
    if (!available) {
      setError("Username is already taken.");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken,
        data: {
          role: "seeker",
          username: username.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log('[SeekerSignup] SignUp response:', { user: signUpData.user?.id, error: signUpError });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
      return;
    }

    if (signUpData.user && signUpData.session) {
      try {
        console.log('[SeekerSignup] Creating seeker profile for user:', signUpData.user.id);
        await createProfileForRole(signUpData.user, "seeker", { username: username.trim() });
        console.log('[SeekerSignup] Profile created, redirecting to dashboard');
        navigate("/dashboard/seeker", { replace: true });
        return;
      } catch (profileError) {
        console.error('[SeekerSignup] Profile creation failed:', profileError);
        setError(profileError instanceof Error ? profileError.message : "Could not create seeker profile.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <AuthShell>
        <div className="text-center py-8">
          <h1 className="font-display text-[32px] leading-tight text-foreground">Check your email</h1>
          <p className="font-body text-[13px] text-muted-foreground mt-2">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-3">
            Didn't receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.resend({ type: "signup", email });
              }}
              className="text-foreground underline echo-fade"
            >
              resend the email
            </button>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="font-display text-[36px] leading-tight text-foreground">Find support</h1>
        <p className="font-body text-[12px] text-muted-foreground mt-1">
          Create a Seeker account to connect with trained Listeners.
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <EchoInput
            label="Username"
            type="text"
            placeholder="@yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            required
          />

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

          <div className="mt-1">
            <span className="font-body text-[12px] text-muted-foreground block mb-1">Verify you're human</span>
            <HCaptcha
              ref={captchaRef}
              sitekey={HCAPTCHA_SITE_KEY}
              theme="light"
              onVerify={(token) => { setCaptchaToken(token); setCaptchaFailed(false); }}
              onExpire={() => setCaptchaToken(null)}
              onLoad={() => setCaptchaLoaded(true)}
              onError={() => {
                setCaptchaToken(null);
                setCaptchaFailed(true);
                setError("Captcha failed to load. Please refresh the page. If the issue persists, try disabling ad blockers.");
              }}
            />
            {!captchaLoaded && !captchaFailed && (
              <p className="font-body text-[11px] text-muted-foreground">Loading verification…</p>
            )}
            {captchaFailed && (
              <p className="font-body text-[11px] text-foreground">⚠ Captcha unavailable. Please refresh and try again.</p>
            )}
          </div>

          <label className="flex items-start gap-1 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={crisisConfirm}
              onChange={(e) => setCrisisConfirm(e.target.checked)}
              className="mt-[3px] accent-foreground"
            />
            <span className="font-body text-[11px] text-foreground leading-tight">
              I confirm I am not in immediate danger or experiencing suicidal thoughts.
              If you are in crisis, please call emergency services or a crisis line immediately.
            </span>
          </label>

          <label className="flex items-start gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-[3px] accent-foreground"
            />
            <span className="font-body text-[11px] text-foreground leading-tight">
              I agree to Echo's Terms of Service and Privacy Policy.
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
            {loading ? "Creating account..." : "Create Seeker Account"}
          </EchoButton>

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 border-t border-muted" />
            <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-muted" />
          </div>

          <GoogleSignInButton label="Sign up with Google" />

          <p className="font-body text-[11px] text-muted-foreground text-center mt-1">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline echo-fade">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default SeekerSignup;
