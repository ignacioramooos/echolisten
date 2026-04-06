import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const ListenerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [certified, setCertified] = useState(false);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [formationProgress, setFormationProgress] = useState<FormationStep | null>(null);

  const [sessions, setSessions] = useState<FullSession[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      // Verify listener profile exists
      const { data: profile } = await (supabase as any)
        .from("listener_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        navigate("/login", { replace: true });
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

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

      const { data: sessData } = await supabase
        .from("sessions")
        .select("id, created_at, status, timer_end_at, topic_snippet, seeker_id, listener_id")
        .eq("listener_id", user.id)
        .eq("status", "ended")
        .order("created_at", { ascending: false })
        .limit(50);
      if (sessData) setSessions(sessData as FullSession[]);

      const { data: ratingData } = await supabase
        .from("session_ratings")
        .select("session_id, rating")
        .not("rating", "is", null);
      if (ratingData) setRatings(ratingData as RatingRow[]);

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

  function isThisWeek(ts: string) {
    const d = new Date(ts);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }

  function isLastWeek(ts: string) {
    const d = new Date(ts);
    const now = new Date();
    const startThisWeek = new Date(now);
    startThisWeek.setDate(now.getDate() - now.getDay());
    startThisWeek.setHours(0, 0, 0, 0);
    const startLastWeek = new Date(startThisWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);
    return d >= startLastWeek && d < startThisWeek;
  }

  const thisWeek = sessions.filter((s) => isThisWeek(s.created_at)).length;
  const lastWeek = sessions.filter((s) => isLastWeek(s.created_at)).length;
  const weekDiff = thisWeek - lastWeek;

  const sessionIds = new Set(sessions.map((s) => s.id));
  const relevantRatings = ratings.filter((r) => sessionIds.has(r.session_id) && r.rating !== null);
  const positiveRatings = relevantRatings.filter((r) => (r.rating ?? 0) >= 4).length;
  const positivePercent = relevantRatings.length > 0
    ? Math.round((positiveRatings / relevantRatings.length) * 100) : 0;

  const ratingMap = new Map(ratings.map((r) => [r.session_id, r.rating]));
  const TOTAL_FORMATION_STEPS = 9;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">{t("common.loading")}</p>
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
              LISTENER
            </span>
            <span className="font-body text-[11px] text-muted-foreground">{email}</span>
            <Link to="/settings">
              <EchoButton variant="outline" size="sm">{t("nav.settings")}</EchoButton>
            </Link>
            <EchoButton variant="outline" size="sm" onClick={handleLogout}>
              {t("nav.logout")}
            </EchoButton>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-echo px-2 py-4">
        <div className="flex flex-col gap-5">
          {/* Certification status */}
          {!certified ? (
            <div className="bg-foreground text-background px-3 py-2 flex items-center justify-between">
              <p className="font-body text-[13px]">{t("dashboard.completeFormation")}</p>
              <Link to="/formation">
                <EchoButton
                  variant="outline"
                  size="sm"
                  className="border-background text-background hover:bg-background hover:text-foreground"
                >
                  {t("dashboard.continue")}
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

          {/* Stats */}
          <section>
            <h2 className="font-display text-[24px] leading-tight mb-2">{t("dashboard.thisWeek")}</h2>
            <div className="grid grid-cols-2 gap-0">
              <StatBox label={t("dashboard.sessionsThisWeek")} value={thisWeek}
                sub={`vs ${lastWeek} last week ${weekDiff > 0 ? "↑" : weekDiff < 0 ? "↓" : "—"}`} />
              <StatBox label={t("dashboard.totalSupported")} value={sessions.length} />
              <StatBox label={t("dashboard.avgDuration")} value="—" />
              <StatBox
                label={t("dashboard.positiveRatings")}
                value={relevantRatings.length > 0 ? `${positivePercent}%` : "—"}
              />
            </div>
          </section>

          {/* Listen CTA */}
          <section>
            <h2 className="font-display text-[28px] leading-tight">{t("dashboard.readyToListen")}</h2>
            <p className="font-body text-[13px] text-muted-foreground mt-1">
              {waitingCount === 0
                ? t("dashboard.noOneWaiting")
                : `${waitingCount} ${waitingCount === 1 ? "person" : "people"} waiting.`}
            </p>
            <div className="mt-2">
              <Link to="/listen">
                <EchoButton variant="solid" size="md" disabled={!certified}>
                  {t("dashboard.openQueue")}
                </EchoButton>
              </Link>
            </div>
          </section>

          {/* Recent sessions */}
          <section className="border-t border-foreground pt-3">
            <h2 className="font-display text-[24px] leading-tight mb-2">{t("dashboard.recentSessions")}</h2>
            {sessions.length === 0 ? (
              <p className="font-body text-[13px] text-muted-foreground">{t("dashboard.noSessionsYet")}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground">
                    {["Date", "Rating", "Topic"].map((h) => (
                      <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((s) => {
                    const rat = ratingMap.get(s.id);
                    return (
                      <tr key={s.id} className="border-b border-secondary">
                        <td className="font-body text-[12px] text-foreground py-1 pr-2">{formatDate(s.created_at)}</td>
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
            )}
          </section>

          {/* Formation progress */}
          {!certified && formationProgress && (
            <section className="border-t border-foreground pt-3">
              <h2 className="font-display text-[24px] leading-tight mb-2">{t("dashboard.formationProgress")}</h2>
              <div className="flex items-center gap-1">
                {Array.from({ length: TOTAL_FORMATION_STEPS }, (_, i) => {
                  const done = formationProgress.steps_completed.includes(`step${i + 1}`);
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span className={`font-body text-[14px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {done ? "●" : "○"}
                      </span>
                      {i < TOTAL_FORMATION_STEPS - 1 && <span className="font-body text-[10px] text-muted-foreground">—</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2">
                <Link to="/formation">
                  <EchoButton variant="outline" size="sm">{t("dashboard.continueFormation")}</EchoButton>
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="border-t border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1.5">
          <p className="font-body text-[10px] text-muted-foreground">
            ● Echo is peer support only. Listeners are trained volunteers, not clinicians.
            For emergencies, contact your local crisis services.
          </p>
        </div>
      </div>
    </div>
  );
};

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

export default ListenerDashboard;
