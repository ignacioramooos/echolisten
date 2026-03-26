import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoBadge } from "@/components/echo/EchoBadge";

interface FullSession {
  id: string;
  created_at: string;
  status: string;
  timer_end_at: string | null;
  topic_snippet: string | null;
  seeker_id: string;
  listener_id: string | null;
}

interface RatingRow {
  session_id: string;
  rating: number | null;
}

interface FormationStep {
  steps_completed: string[];
  score: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"listener" | "seeker" | null>(null);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener
  const [certified, setCertified] = useState(false);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [formationProgress, setFormationProgress] = useState<FormationStep | null>(null);

  // Stats
  const [allSessions, setAllSessions] = useState<FullSession[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      setUserId(user.id);
      setEmail(user.email || "");
      const userRole = user.user_metadata?.role as "listener" | "seeker" || "seeker";
      setRole(userRole);

      if (userRole === "listener") {
        const { data: progress } = await supabase
          .from("formation_progress")
          .select("bot_passed, badge_earned_at, steps_completed, score")
          .eq("user_id", user.id)
          .maybeSingle();

        if (progress?.bot_passed) {
          setCertified(true);
          setCertifiedAt(progress.badge_earned_at);
        }
        if (progress) {
          setFormationProgress({ steps_completed: progress.steps_completed || [], score: progress.score });
        }

        const { count } = await supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .eq("status", "waiting");
        setWaitingCount(count || 0);

        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, created_at, status, timer_end_at, topic_snippet, seeker_id, listener_id")
          .eq("listener_id", user.id)
          .eq("status", "ended")
          .order("created_at", { ascending: false })
          .limit(50);
        if (sessions) setAllSessions(sessions as FullSession[]);

        // Get ratings for these sessions
        const { data: ratingData } = await supabase
          .from("session_ratings")
          .select("session_id, rating")
          .not("rating", "is", null);
        if (ratingData) setRatings(ratingData as RatingRow[]);

      } else {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, created_at, status, timer_end_at, topic_snippet, seeker_id, listener_id")
          .eq("seeker_id", user.id)
          .eq("status", "ended")
          .order("created_at", { ascending: false })
          .limit(50);
        if (sessions) setAllSessions(sessions as FullSession[]);

        const { data: ratingData } = await supabase
          .from("session_ratings")
          .select("session_id, rating")
          .eq("user_id", user.id);
        if (ratingData) setRatings(ratingData as RatingRow[]);
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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

      <main className="flex-1 mx-auto w-full max-w-echo px-2 py-4">
        {role === "listener" ? (
          <ListenerView
            certified={certified}
            certifiedAt={certifiedAt}
            waitingCount={waitingCount}
            sessions={allSessions}
            ratings={ratings}
            formationProgress={formationProgress}
          />
        ) : (
          <SeekerView sessions={allSessions} ratings={ratings} userId={userId!} />
        )}
      </main>

      <div className="border-t border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1.5">
          <p className="font-body text-[10px] text-muted-foreground">
            ● Echo is peer support only. Listeners are trained volunteers, not clinicians. For emergencies, contact your local crisis services.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers ── */

const formatDate = (ts: string) =>
  new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

function getSessionDuration(s: FullSession): number | null {
  if (!s.timer_end_at) return null;
  // Timer was set to 10 min from session start. Duration = 10 - remaining (or full if ended naturally)
  const created = new Date(s.created_at).getTime();
  const timerEnd = new Date(s.timer_end_at).getTime();
  // Total allocated time
  const totalMin = Math.round((timerEnd - created) / 60000);
  return Math.max(1, Math.min(totalMin, 30));
}

function isThisWeek(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function isLastWeek(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  return d >= startOfLastWeek && d < startOfThisWeek;
}

/* ── Stat Box ── */

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-foreground p-3 flex flex-col justify-between min-h-[100px]">
      <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div>
        <span className="font-display text-[32px] leading-none">{value}</span>
        {sub && <p className="font-body text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Listener View ── */

function ListenerView({
  certified,
  certifiedAt,
  waitingCount,
  sessions,
  ratings,
  formationProgress,
}: {
  certified: boolean;
  certifiedAt: string | null;
  waitingCount: number;
  sessions: FullSession[];
  ratings: RatingRow[];
  formationProgress: FormationStep | null;
}) {
  const thisWeek = sessions.filter((s) => isThisWeek(s.created_at)).length;
  const lastWeek = sessions.filter((s) => isLastWeek(s.created_at)).length;
  const weekDiff = thisWeek - lastWeek;
  const weekSub = lastWeek > 0 || thisWeek > 0
    ? `vs ${lastWeek} last week ${weekDiff > 0 ? "↑" : weekDiff < 0 ? "↓" : "—"}`
    : undefined;

  const totalSupported = sessions.length;

  const durations = sessions.map(getSessionDuration).filter((d): d is number => d !== null);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  const sessionIds = new Set(sessions.map((s) => s.id));
  const relevantRatings = ratings.filter((r) => sessionIds.has(r.session_id) && r.rating !== null);
  const positiveRatings = relevantRatings.filter((r) => (r.rating ?? 0) >= 4).length;
  const positivePercent = relevantRatings.length > 0
    ? Math.round((positiveRatings / relevantRatings.length) * 100)
    : 0;

  const ratingMap = new Map(ratings.map((r) => [r.session_id, r.rating]));
  const recentSessions = sessions.slice(0, 10);

  const TOTAL_FORMATION_STEPS = 9;

  return (
    <div className="flex flex-col gap-5">
      {/* Section 1: Status */}
      {!certified ? (
        <div className="bg-foreground text-background px-3 py-2 flex items-center justify-between">
          <p className="font-body text-[13px]">Complete The Formation to listen.</p>
          <Link to="/formation">
            <EchoButton
              variant="outline"
              size="sm"
              className="border-background text-background hover:bg-background hover:text-foreground"
            >
              Continue →
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

      {/* Section 2: Weekly Stats */}
      <section>
        <h2 className="font-display text-[24px] leading-tight mb-2">This Week</h2>
        <div className="grid grid-cols-2 gap-0">
          <StatBox label="Sessions this week" value={thisWeek} sub={weekSub} />
          <StatBox label="Total people supported" value={totalSupported} />
          <StatBox label="Avg session duration" value={avgDuration > 0 ? `${avgDuration} min` : "—"} />
          <StatBox
            label="Positive ratings"
            value={relevantRatings.length > 0 ? `${positivePercent}%` : "—"}
            sub={relevantRatings.length > 0 ? `${positiveRatings} of ${relevantRatings.length}` : undefined}
          />
        </div>
      </section>

      {/* Section 3: Jump In */}
      <section>
        <h2 className="font-display text-[28px] leading-tight">Ready to listen?</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1">
          {waitingCount === 0
            ? "No one is waiting right now."
            : `${waitingCount} ${waitingCount === 1 ? "person is" : "people are"} waiting.`}
        </p>
        <div className="mt-2">
          <Link to="/listen">
            <EchoButton variant="solid" size="md" disabled={!certified}>
              Open Queue →
            </EchoButton>
          </Link>
        </div>
      </section>

      {/* Section 4: Recent Sessions */}
      <section className="border-t border-foreground pt-3">
        <h2 className="font-display text-[24px] leading-tight mb-2">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="font-body text-[13px] text-muted-foreground">
            No sessions yet. Your first one is waiting.
          </p>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground">
                  {["Date", "Duration", "Rating", "Topic"].map((h) => (
                    <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const dur = getSessionDuration(s);
                  const rat = ratingMap.get(s.id);
                  return (
                    <tr key={s.id} className="border-b border-secondary">
                      <td className="font-body text-[12px] text-foreground py-1 pr-2">{formatDate(s.created_at)}</td>
                      <td className="font-body text-[12px] text-muted-foreground py-1 pr-2">{dur ? `${dur} min` : "—"}</td>
                      <td className="font-body text-[12px] py-1 pr-2">
                        {rat != null ? "●".repeat(rat) + "○".repeat(5 - rat) : "—"}
                      </td>
                      <td className="font-body text-[12px] text-muted-foreground py-1 truncate max-w-[180px]">
                        {s.topic_snippet || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sessions.length > 10 && (
              <p className="font-body text-[11px] text-muted-foreground mt-1 underline cursor-pointer">See all</p>
            )}
          </>
        )}
      </section>

      {/* Section 5: Formation Progress (if not completed) */}
      {!certified && formationProgress && (
        <section className="border-t border-foreground pt-3">
          <h2 className="font-display text-[24px] leading-tight mb-2">Formation Progress</h2>
          <div className="flex items-center gap-1">
            {Array.from({ length: TOTAL_FORMATION_STEPS }, (_, i) => {
              const stepKey = `step${i + 1}`;
              const done = formationProgress.steps_completed.includes(stepKey);
              return (
                <div key={i} className="flex items-center gap-1">
                  <span className={`font-body text-[14px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {done ? "●" : "○"}
                  </span>
                  {i < TOTAL_FORMATION_STEPS - 1 && (
                    <span className="font-body text-[10px] text-muted-foreground">—</span>
                  )}
                </div>
              );
            })}
          </div>
          {formationProgress.score != null && (
            <p className="font-body text-[11px] text-muted-foreground mt-1">
              Score: {formationProgress.score} / 46
            </p>
          )}
          <div className="mt-2">
            <Link to="/formation">
              <EchoButton variant="outline" size="sm">Continue Formation →</EchoButton>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Seeker View ── */

function SeekerView({ sessions, ratings, userId }: { sessions: FullSession[]; ratings: RatingRow[]; userId: string }) {
  const totalSessions = sessions.length;
  const lastSessionDate = sessions.length > 0 ? formatDate(sessions[0].created_at) : "—";
  const uniqueListeners = new Set(sessions.map((s) => s.listener_id).filter(Boolean)).size;

  const ratingMap = new Map(ratings.map((r) => [r.session_id, r.rating]));
  const recentSessions = sessions.slice(0, 10);

  // FUTURE: Link to PDF resource library
  const resources = [
    { title: "Anxiety Guide", desc: "Understanding and managing anxiety in daily life." },
    { title: "Managing Stress", desc: "Simple techniques to reduce stress and find calm." },
    { title: "Understanding Depression", desc: "What depression looks like and where to find help." },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Section 1: CTA */}
      <div>
        <h1 className="font-display text-[40px] leading-tight">How are you doing today?</h1>
        <div className="flex flex-col gap-1 mt-3">
          <Link to="/chat/new">
            <EchoButton variant="solid" size="md">
              Talk to Someone
            </EchoButton>
          </Link>
          <Link to="/aura">
            <EchoButton variant="outline" size="sm">
              Talk to Aura instead
            </EchoButton>
          </Link>
        </div>
      </div>

      {/* Section 2: Quick Stats */}
      <section>
        <div className="grid grid-cols-3 gap-0">
          <StatBox label="Sessions total" value={totalSessions} />
          <StatBox label="Last session" value={lastSessionDate} />
          <StatBox label="Listeners spoken to" value={uniqueListeners} />
        </div>
      </section>

      {/* Section 3: Recent Sessions */}
      <section className="border-t border-foreground pt-3">
        <h2 className="font-display text-[24px] leading-tight mb-2">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="font-body text-[13px] text-muted-foreground">No sessions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground">
                {["Date", "Listener", "Your Rating"].map((h) => (
                  <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, i) => {
                const rat = ratingMap.get(s.id);
                const listenerLabel = s.listener_id
                  ? `Echo Listener #${s.listener_id.slice(0, 4).toUpperCase()}`
                  : "—";
                return (
                  <tr key={s.id} className="border-b border-secondary">
                    <td className="font-body text-[12px] text-foreground py-1 pr-2">{formatDate(s.created_at)}</td>
                    <td className="font-body text-[12px] text-muted-foreground py-1 pr-2">{listenerLabel}</td>
                    <td className="font-body text-[12px] py-1 pr-2">
                      {rat != null ? "●".repeat(rat) + "○".repeat(5 - rat) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Section 4: Resources */}
      <section className="border-t border-foreground pt-3">
        <h2 className="font-display text-[24px] leading-tight mb-2">Helpful Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {resources.map((r) => (
            // FUTURE: Link to PDF resource library
            <div key={r.title} className="border border-foreground p-3 flex flex-col justify-between min-h-[90px]">
              <div>
                <p className="font-body text-[13px] text-foreground font-bold">{r.title}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
              <p className="font-body text-[11px] text-foreground mt-2 underline cursor-pointer">Read →</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
