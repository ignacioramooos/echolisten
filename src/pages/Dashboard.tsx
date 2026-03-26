import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoBadge } from "@/components/echo/EchoBadge";

interface SessionRow {
  id: string;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"listener" | "seeker" | null>(null);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener-specific
  const [certified, setCertified] = useState(false);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);

  // Shared
  const [pastSessions, setPastSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      setUserId(user.id);
      setEmail(user.email || "");
      const userRole = user.user_metadata?.role as "listener" | "seeker" || "seeker";
      setRole(userRole);

      if (userRole === "listener") {
        // Check formation progress
        const { data: progress } = await supabase
          .from("formation_progress")
          .select("bot_passed, badge_earned_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (progress?.bot_passed) {
          setCertified(true);
          setCertifiedAt(progress.badge_earned_at);
        }

        // Count waiting sessions
        const { count } = await supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "waiting");

        setWaitingCount(count || 0);

        // Past sessions as listener
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, created_at, status")
          .eq("listener_id", user.id)
          .eq("status", "ended")
          .order("created_at", { ascending: false })
          .limit(20);

        if (sessions) setPastSessions(sessions);
      } else {
        // Past sessions as seeker
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, created_at, status")
          .eq("seeker_id", user.id)
          .eq("status", "ended")
          .order("created_at", { ascending: false })
          .limit(20);

        if (sessions) setPastSessions(sessions);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="border-b border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1 flex items-center justify-between">
          <EchoLogo />
          <div className="flex items-center gap-2">
            <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
              {role === "listener" ? "LISTENER ●" : "SEEKER"}
            </span>
            <span className="font-body text-[11px] text-muted-foreground">{email}</span>
            <EchoButton variant="outline" size="sm" onClick={handleLogout}>
              Log Out
            </EchoButton>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 mx-auto w-full max-w-echo px-2 py-4">
        {role === "listener" ? (
          <ListenerView
            certified={certified}
            certifiedAt={certifiedAt}
            waitingCount={waitingCount}
            pastSessions={pastSessions}
          />
        ) : (
          <SeekerView pastSessions={pastSessions} />
        )}
      </main>

      {/* Bottom notice */}
      <div className="border-t border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1">
          <p className="font-body text-[10px] text-muted-foreground">
            ● Echo is not a crisis service, therapy, or medical support. Listeners are volunteers.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Listener View ── */

function ListenerView({
  certified,
  certifiedAt,
  waitingCount,
  pastSessions,
}: {
  certified: boolean;
  certifiedAt: string | null;
  waitingCount: number;
  pastSessions: SessionRow[];
}) {
  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      {/* Section 1: Status */}
      {!certified ? (
        <div className="bg-foreground text-background px-2 py-2 flex items-center justify-between">
          <p className="font-body text-[13px]">Complete The Formation to unlock listening.</p>
          <Link to="/formation">
            <EchoButton
              variant="outline"
              size="sm"
              className="border-background text-background hover:bg-background hover:text-foreground"
            >
              Continue Formation →
            </EchoButton>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <EchoBadge label="Echo Listener" variant="earned" />
          {certifiedAt && (
            <span className="font-body text-[11px] text-muted-foreground">
              Certified {formatDate(certifiedAt)}
            </span>
          )}
        </div>
      )}

      {/* Section 2: Jump In */}
      <section>
        <h2 className="font-display text-[28px] leading-tight">Ready to listen?</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1">
          {waitingCount === 0
            ? "No one is waiting right now."
            : `${waitingCount} ${waitingCount === 1 ? "person is" : "people are"} waiting.`}
        </p>
        <div className="mt-2">
          <Link to="/listen">
            <EchoButton variant="outline" size="md" disabled={!certified}>
              Open Queue →
            </EchoButton>
          </Link>
        </div>
      </section>

      {/* Section 3: History */}
      <section className="border-t border-foreground pt-3">
        <h2 className="font-display text-[28px] leading-tight">Past Sessions</h2>
        <SessionTable sessions={pastSessions} />
      </section>
    </div>
  );
}

/* ── Seeker View ── */

function SeekerView({ pastSessions }: { pastSessions: SessionRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[40px] leading-tight">How are you doing?</h1>

      <div className="flex flex-col gap-1">
        <Link to="/chat/new">
          <EchoButton variant="solid" size="md">
            Talk to Someone
          </EchoButton>
        </Link>
        <Link to="/aura">
          <EchoButton variant="outline" size="sm">
            Talk to Aura (AI Listener)
          </EchoButton>
        </Link>
      </div>

      <section className="border-t border-foreground pt-3">
        <h2 className="font-display text-[28px] leading-tight">Past Sessions</h2>
        <SessionTable sessions={pastSessions} />
      </section>

      <p className="font-body text-[11px] text-muted-foreground">
        Echo is peer support only. For emergencies, contact crisis services.
      </p>
    </div>
  );
}

/* ── Shared Session Table ── */

function SessionTable({ sessions }: { sessions: SessionRow[] }) {
  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  if (sessions.length === 0) {
    return (
      <p className="font-body text-[13px] text-muted-foreground mt-1">No sessions yet.</p>
    );
  }

  return (
    <table className="w-full mt-1">
      <thead>
        <tr className="border-b border-foreground">
          <th className="font-body text-[11px] uppercase tracking-widest text-muted-foreground text-left py-0.5">
            Date
          </th>
          <th className="font-body text-[11px] uppercase tracking-widest text-muted-foreground text-left py-0.5">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.id} className="border-b border-secondary">
            <td className="font-body text-[12px] text-foreground py-0.5">
              {formatDate(s.created_at)}
            </td>
            <td className="font-body text-[12px] text-muted-foreground py-0.5 capitalize">
              {s.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Dashboard;
