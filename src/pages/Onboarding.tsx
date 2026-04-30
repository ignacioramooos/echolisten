import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createProfileForRole, type AppRole } from "@/lib/profiles";
import { EchoLogo } from "@/components/echo/EchoLogo";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<AppRole | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate("/login", { replace: true });
    };
    checkUser();
  }, [navigate]);

  const chooseRole = async (role: AppRole) => {
    setLoadingRole(role);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      await createProfileForRole(user, role, user.user_metadata || {});
      navigate(role === "listener" ? "/dashboard/listener" : "/dashboard/seeker", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish account setup.");
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-3 py-2">
        <EchoLogo />
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[520px] border border-foreground p-5">
          <h1 className="font-body text-[20px] font-medium">Choose your room</h1>
          <p className="font-body text-[12px] text-muted-foreground mt-2">
            Your account needs one role before we can place you anywhere.
          </p>

          <div className="grid sm:grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => chooseRole("seeker")}
              disabled={!!loadingRole}
              className="border border-foreground p-4 text-left echo-fade disabled:opacity-40"
            >
              <span className="block font-body text-[14px] font-medium">Seeker</span>
              <span className="block font-body text-[11px] text-muted-foreground mt-2">
                Write, reflect, and choose when to be heard.
              </span>
            </button>
            <button
              type="button"
              onClick={() => chooseRole("listener")}
              disabled={!!loadingRole}
              className="border border-foreground p-4 text-left echo-fade disabled:opacity-40"
            >
              <span className="block font-body text-[14px] font-medium">Listener</span>
              <span className="block font-body text-[11px] text-muted-foreground mt-2">
                Complete formation and support incoming sessions.
              </span>
            </button>
          </div>

          {loadingRole && (
            <p className="font-body text-[11px] text-muted-foreground mt-4">Creating {loadingRole} profile...</p>
          )}
          {error && <p className="font-body text-[11px] text-foreground mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;

