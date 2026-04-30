import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { EchoButton } from "@/components/echo/EchoButton";
import { allTopics, supportedLanguages } from "@/data/topics";
import SharedFeatureNav from "@/components/echo/SharedFeatureNav";

interface FullSession {
  id: string;
  created_at: string;
  status: string;
  timer_end_at: string | null;
  topic_snippet: string | null;
  seeker_id: string;
  listener_id: string | null;
  topics: string[];
  requested_language: string | null;
}

interface RatingRow {
  session_id: string;
  rating: number | null;
}

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const db = supabase as any;
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<FullSession[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);

  // New session form
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      // Verify seeker profile exists
      const { data: profile } = await supabase
        .from("seeker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        navigate("/login", { replace: true });
        return;
      }

      setUserId(user.id);

      const { data: sessData } = await supabase
        .from("sessions")
        .select("id, created_at, status, timer_end_at, topic_snippet, seeker_id, listener_id")
        .eq("seeker_id", user.id)
        .eq("status", "ended")
        .order("created_at", { ascending: false })
        .limit(50);
      if (sessData) setSessions(sessData as any);

      const { data: ratingData } = await supabase
        .from("session_ratings")
        .select("session_id, rating")
        .eq("user_id", user.id);
      if (ratingData) setRatings(ratingData as RatingRow[]);

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const canCreate = selectedTopics.length > 0 && firstMessage.trim().length > 0;

  const handleCreateSession = async () => {
    if (!canCreate || !userId || creating) return;
    setCreating(true);

    const { data: request, error } = await db
      .from("chat_requests")
      .insert({
        seeker_id: userId,
        status: "pending",
        title: selectedTopics.slice(0, 2).join(", "),
        topic: firstMessage.trim(),
      })
      .select()
      .single();

    if (error || !request) {
      setCreating(false);
      return;
    }

    navigate(`/chat/new?request=${request.id}`);
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const ratingMap = new Map(ratings.map((r) => [r.session_id, r.rating]));

  // FUTURE: Link to PDF resource library
  const resources = [
    { title: "Anxiety Guide", desc: "Understanding and managing anxiety in daily life." },
    { title: "Managing Stress", desc: "Simple techniques to reduce stress and find calm." },
    { title: "Understanding Depression", desc: "What depression looks like and where to find help." },
  ];

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
              SEEKER
            </span>
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
          {/* Primary CTA */}
          <section>
            <h1 className="font-display text-[40px] leading-tight">How are you doing today?</h1>

            <div className="border border-foreground p-4 mt-3">
              <h2 className="font-body text-[14px] text-foreground font-medium">Start a new session</h2>

              {/* Step A: Topics */}
              <div className="mt-3">
                <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                  What would you like to talk about?
                </label>
                <div className="flex flex-wrap gap-0.5 mt-1 max-h-[120px] overflow-y-auto">
                  {allTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`font-body text-[11px] border px-1.5 py-0.5 echo-fade ${
                        selectedTopics.includes(topic)
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground text-foreground"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step B: Language */}
              <div className="mt-3">
                <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                  Preferred language for this session
                </label>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`font-body text-[11px] border px-1.5 py-0.5 echo-fade ${
                        selectedLang === lang
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground text-foreground"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step C: First message */}
              <div className="mt-3">
                <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                  Your first message
                </label>
                <div className="relative mt-1">
                  <textarea
                    value={firstMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setFirstMessage(e.target.value);
                    }}
                    placeholder="Start here. Your first message will be shown to a Listener who chooses to accept your session."
                    className="w-full border border-foreground bg-background px-2 py-2 font-body text-[13px] text-foreground placeholder:text-muted-foreground placeholder:italic outline-none resize-none"
                    rows={3}
                  />
                  <span className="absolute bottom-1 right-1 font-body text-[10px] text-muted-foreground">
                    {firstMessage.length}/500
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <EchoButton
                  variant="solid"
                  size="md"
                  onClick={handleCreateSession}
                  disabled={!canCreate || creating}
                  className={!canCreate || creating ? "opacity-40 cursor-not-allowed" : ""}
                >
                  {creating ? "Finding a Listener..." : "Find a Listener"}
                </EchoButton>
              </div>
            </div>

            {/* Quick access to Aura */}
            <div className="mt-2">
              <Link to="/aura">
                <EchoButton variant="outline" size="sm">
                  {t("dashboard.talkToAura")}
                </EchoButton>
              </Link>
            </div>
          </section>

          {/* Shared features */}
          <SharedFeatureNav />

          {/* Past Sessions */}
          <section className="border-t border-foreground pt-3">
            <h2 className="font-display text-[24px] leading-tight mb-2">Past Sessions</h2>
            {sessions.length === 0 ? (
              <p className="font-body text-[13px] text-muted-foreground">No sessions yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground">
                    {["Date", "Duration", "Listener", "Rating"].map((h) => (
                      <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((s) => {
                    const rat = ratingMap.get(s.id);
                    const listenerLabel = s.listener_id
                      ? `Listener #${s.listener_id.slice(0, 4).toUpperCase()}`
                      : "—";
                    return (
                      <tr key={s.id} className="border-b border-secondary">
                        <td className="font-body text-[12px] text-foreground py-1 pr-2">{formatDate(s.created_at)}</td>
                        <td className="font-body text-[12px] text-muted-foreground py-1 pr-2">—</td>
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

          {/* Resources */}
          <section className="border-t border-foreground pt-3">
            <h2 className="font-display text-[24px] leading-tight mb-2">Helpful Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {resources.map((r) => (
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

export default SeekerDashboard;
