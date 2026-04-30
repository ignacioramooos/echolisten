import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole, type UserRoleState } from "@/lib/resolve-role";

type AllowedRole = "seeker" | "listener";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allow?: AllowedRole[];
}

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const location = useLocation();
  const [role, setRole] = useState<UserRoleState | "loading" | "signed-out">("loading");

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setRole("signed-out");
        return;
      }

      const resolvedRole = await resolveUserRole(user.id);
      if (!cancelled) setRole(resolvedRole);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (role === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (role === "signed-out") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role === "none") {
    return <Navigate to="/onboarding" replace />;
  }

  if (role === "both") {
    return <Navigate to="/onboarding" replace />;
  }

  if (allow && !allow.includes(role)) {
    return <Navigate to={role === "listener" ? "/dashboard/listener" : "/dashboard/seeker"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

