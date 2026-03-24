import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <AuthShell>
      <h1 className="font-display text-[36px] leading-tight text-foreground">Reset password.</h1>

      {sent ? (
        <div className="mt-3">
          <p className="font-body text-[13px] text-foreground">
            Check your email for a reset link.
          </p>
          <p className="font-body text-[11px] text-muted-foreground mt-2">
            <Link to="/login" className="text-foreground underline echo-fade">
              ← Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <EchoInput
            label="Email address"
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
            {loading ? "Sending..." : "Send Reset Link"}
          </EchoButton>

          <p className="font-body text-[11px] text-muted-foreground text-center mt-1">
            <Link to="/login" className="text-foreground underline echo-fade">
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
