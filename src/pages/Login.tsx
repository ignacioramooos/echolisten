import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/echo/AuthShell";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";

const Login = () => {
  const navigate = useNavigate();
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

    const role = data.user?.user_metadata?.role;
    if (role === "listener") {
      navigate("/formation");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <h1 className="font-display text-[36px] leading-tight text-foreground">Welcome back.</h1>

        <div className="mt-3 flex flex-col gap-2">
          <EchoInput
            label="Email address"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-0.5">
            <label className="font-body text-[12px] uppercase tracking-widest text-foreground">
              Password
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
            {loading ? "Signing in..." : "Sign In"}
          </EchoButton>

          <div className="flex flex-col items-center gap-0.5 mt-1">
            <p className="font-body text-[11px] text-muted-foreground">
              New to Echo?{" "}
              <Link to="/signup" className="text-foreground underline echo-fade">
                Create an account →
              </Link>
            </p>
            <p className="font-body text-[11px] text-muted-foreground">
              <Link to="/reset-password" className="text-foreground underline echo-fade">
                Forgot password →
              </Link>
            </p>
          </div>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;
