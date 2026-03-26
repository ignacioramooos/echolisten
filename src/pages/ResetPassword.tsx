import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if this is a recovery callback (user clicked reset link in email)
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError(t("auth.passwordTooShort") || "Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setUpdated(true);
    setLoading(false);
  };

  // Recovery mode: set new password
  if (isRecovery) {
    return (
      <AuthShell>
        <h1 className="font-display text-[36px] leading-tight text-foreground">
          {t("auth.setNewPassword") || "Set New Password"}
        </h1>

        {updated ? (
          <div className="mt-3">
            <p className="font-body text-[13px] text-foreground">
              {t("auth.passwordUpdated") || "Your password has been updated."}
            </p>
            <EchoButton
              type="button"
              variant="solid"
              size="md"
              className="mt-2"
              onClick={() => navigate("/dashboard")}
            >
              {t("auth.goToDashboard") || "Go to Dashboard"}
            </EchoButton>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="mt-3 flex flex-col gap-2">
            <EchoInput
              label={t("auth.newPassword") || "New Password"}
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {error && (
              <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
            )}

            <EchoButton type="submit" variant="solid" size="md">
              {loading ? (t("auth.updating") || "Updating...") : (t("auth.updatePassword") || "Update Password")}
            </EchoButton>
          </form>
        )}
      </AuthShell>
    );
  }

  // Default: request reset email
  return (
    <AuthShell>
      <h1 className="font-display text-[36px] leading-tight text-foreground">{t("auth.resetPassword")}</h1>

      {sent ? (
        <div className="mt-3">
          <p className="font-body text-[13px] text-foreground">
            {t("auth.resetSent")}
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-2">
            <Link to="/login" className="text-foreground underline echo-fade">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <p className="font-body text-[12px] text-muted-foreground">{t("auth.resetDesc")}</p>
          <EchoInput
            label={t("auth.email")}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
          )}

          <EchoButton type="submit" variant="solid" size="md">
            {loading ? t("auth.sending") : t("auth.sendReset")}
          </EchoButton>

          <p className="font-body text-[11px] text-muted-foreground text-center mt-1">
            <Link to="/login" className="text-foreground underline echo-fade">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
