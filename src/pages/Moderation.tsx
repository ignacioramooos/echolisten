import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { EchoButton } from "@/components/echo/EchoButton";

/* ── Types ── */

interface FlaggedSession {
  id: string;
  created_at: string;
  topic_snippet: string | null;
  seeker_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  flagged: boolean;
}

interface ListenerOverview {
  user_id: string;
  username: string | null;
  totalSessions: number;
  flaggedSessions: number;
  evaluationFlags: number;
}

interface ListenerProfile {
  user_id: string;
  username: string | null;
  bio: string | null;
  created_at: string | null;
  formationScore: number | null;
  badgeDate: string | null;
  sessionCount: number;
  evalFlags: string[];
}

const EVAL_FLAGS = [
  "Ghost chatting (listener went silent)",
  "Improper blocking",
  "Requesting/sharing contact info",
  "Inappropriate content (sexual, harassment)",
  "Advice-giving (violation of listener protocol)",
  "Crisis mishandling",
  "No issues found",
];

/* ── Main Component ── */

const Moderation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState<"flagged" | "random" | "overview">("flagged");

  // Flagged sessions
  const [flaggedSessions, setFlaggedSessions] = useState<FlaggedSession[]>([]);

  // Transcript viewer
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Random review
  const [randomSession, setRandomSession] = useState<FlaggedSession | null>(null);
  const [randomTranscript, setRandomTranscript] = useState<Message[]>([]);
  const [randomLoading, setRandomLoading] = useState(false);
  const [evalFlags, setEvalFlags] = useState<string[]>([]);
  const [evalNotes, setEvalNotes] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);
  const [evalSubmitted, setEvalSubmitted] = useState(false);

  // Listener overview
  const [listeners, setListeners] = useState<ListenerOverview[]>([]);
  const [listenerProfile, setListenerProfile] = useState<ListenerProfile | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);

      const { data: profile } = await (supabase as any)
        .from("listener_profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile || !["moderator", "admin"].includes(profile.role)) {
        navigate("/dashboard");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  /* ── Flagged Sessions ── */

  const loadFlagged = useCallback(async () => {
    const { data: flaggedMsgSessions } = await supabase
      .from("messages")
      .select("session_id")
      .eq("flagged", true);

    const flaggedIds = new Set((flaggedMsgSessions || []).map((m: any) => m.session_id));

    const { data: sessions } = await supabase
      .from("sessions")
      .select("id, created_at, topic_snippet, seeker_id")
      .eq("status", "ended")
      .order("created_at", { ascending: false })
      .limit(100);

    if (sessions) {
      const flagged = sessions.filter((s: any) => flaggedIds.has(s.id));
      setFlaggedSessions(flagged as FlaggedSession[]);
    }
  }, []);

  useEffect(() => {
    if (authorized) loadFlagged();
  }, [authorized, loadFlagged]);

  const openTranscript = async (sessionId: string) => {
    setViewingSessionId(sessionId);
    setTranscriptLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, sent_at, flagged")
      .eq("session_id", sessionId)
      .order("sent_at", { ascending: true });
    setTranscript((data || []) as Message[]);
    setTranscriptLoading(false);
  };

  /* ── Random Review ── */

  const pullRandom = async () => {
    setRandomLoading(true);
    setEvalSubmitted(false);
    setEvalFlags([]);
    setEvalNotes("");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await supabase
      .from("sessions")
      .select("id, created_at, topic_snippet, seeker_id")
      .eq("status", "ended")
      .gte("created_at", sevenDaysAgo)
      .limit(200);

    if (!sessions || sessions.length === 0) {
      setRandomSession(null);
      setRandomTranscript([]);
      setRandomLoading(false);
      return;
    }

    const picked = sessions[Math.floor(Math.random() * sessions.length)] as FlaggedSession;
    setRandomSession(picked);

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, sender_id, content, sent_at, flagged")
      .eq("session_id", picked.id)
      .order("sent_at", { ascending: true });

    setRandomTranscript((msgs || []) as Message[]);
    setRandomLoading(false);
  };

  const submitEvaluation = async () => {
    if (!randomSession || !userId || evalFlags.length === 0) return;
    setSubmittingEval(true);

    await supabase.from("evaluations").insert({
      session_id: randomSession.id,
      moderator_id: userId,
      flags_checked: evalFlags,
      notes: evalNotes || null,
    } as any);

    setSubmittingEval(false);
    setEvalSubmitted(true);
  };

  /* ── Listener Overview ── */

  const loadListeners = useCallback(async () => {
    const { data: listenerProfiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .eq("role", "listener");

    if (!listenerProfiles) return;

    const { data: allSessions } = await supabase
      .from("sessions")
      .select("id, listener_id, created_at")
      .eq("status", "ended")
      .not("listener_id", "is", null);

    const { data: flaggedMsgs } = await supabase
      .from("messages")
      .select("session_id")
      .eq("flagged", true);

    const { data: allEvals } = await supabase
      .from("evaluations")
      .select("session_id, flags_checked");

    const flaggedSessionIds = new Set((flaggedMsgs || []).map((m: any) => m.session_id));

    const sessionsByListener = new Map<string, string[]>();
    (allSessions || []).forEach((s: any) => {
      if (!s.listener_id) return;
      const arr = sessionsByListener.get(s.listener_id) || [];
      arr.push(s.id);
      sessionsByListener.set(s.listener_id, arr);
    });

    const evalsBySession = new Map<string, number>();
    (allEvals || []).forEach((e: any) => {
      const flags = (e.flags_checked || []).filter((f: string) => f !== "No issues found");
      const current = evalsBySession.get(e.session_id) || 0;
      evalsBySession.set(e.session_id, current + flags.length);
    });

    const overview: ListenerOverview[] = listenerProfiles.map((p: any) => {
      const sessionIds = sessionsByListener.get(p.user_id) || [];
      const flaggedCount = sessionIds.filter((id) => flaggedSessionIds.has(id)).length;
      const evalFlagCount = sessionIds.reduce((sum, id) => sum + (evalsBySession.get(id) || 0), 0);

      return {
        user_id: p.user_id,
        username: p.username,
        totalSessions: sessionIds.length,
        flaggedSessions: flaggedCount,
        evaluationFlags: evalFlagCount,
      };
    });

    overview.sort((a, b) => b.flaggedSessions + b.evaluationFlags - (a.flaggedSessions + a.evaluationFlags));
    setListeners(overview);
  }, []);

  useEffect(() => {
    if (authorized && activeSection === "overview") loadListeners();
  }, [authorized, activeSection, loadListeners]);

  /* ── Listener Profile View ── */

  const viewListenerProfile = async (listenerId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id, username, bio, created_at")
      .eq("user_id", listenerId)
      .maybeSingle();

    const { data: formation } = await supabase
      .from("formation_progress")
      .select("score, badge_earned_at")
      .eq("user_id", listenerId)
      .maybeSingle();

    const { data: sessions } = await supabase
      .from("sessions")
      .select("id")
      .eq("listener_id", listenerId)
      .eq("status", "ended");

    const sessionIds = (sessions || []).map((s: any) => s.id);

    let allFlags: string[] = [];
    if (sessionIds.length > 0) {
      const { data: evals } = await supabase
        .from("evaluations")
        .select("flags_checked")
        .in("session_id", sessionIds);

      allFlags = (evals || []).flatMap((e: any) =>
        (e.flags_checked || []).filter((f: string) => f !== "No issues found")
      );
    }

    setListenerProfile({
      user_id: profile?.user_id || listenerId,
      username: profile?.username || null,
      bio: profile?.bio || null,
      created_at: profile?.created_at || null,
      formationScore: formation?.score ?? null,
      badgeDate: formation?.badge_earned_at || null,
      sessionCount: sessionIds.length,
      evalFlags: allFlags,
    });
  };

  /* ── Render ── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!authorized) return null;

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  const truncateId = (id: string) => id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1 flex items-center justify-between">
          <EchoLogo />
          <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
            Moderation Panel
          </span>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="border-b border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 flex">
          {(["flagged", "random", "overview"] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setActiveSection(sec);
                setViewingSessionId(null);
                setListenerProfile(null);
              }}
              className={`font-body text-[11px] uppercase tracking-widest px-3 py-2 border-b-2 echo-fade ${
                activeSection === sec
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {sec === "flagged" ? "Flagged Sessions" : sec === "random" ? "Random Review" : "Listener Overview"}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-echo px-2 py-4">
        {/* ── Flagged Sessions ── */}
        {activeSection === "flagged" && !viewingSessionId && (
          <section>
            <h2 className="font-display text-[28px] leading-tight mb-3">Flagged Sessions</h2>
            {flaggedSessions.length === 0 ? (
              <p className="font-body text-[13px] text-muted-foreground">No flagged sessions found.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground">
                    {["Session ID", "Flag Reason", "Date", "Review"].map((h) => (
                      <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flaggedSessions.map((s) => (
                    <tr key={s.id} className="border-b border-secondary">
                      <td className="font-body text-[12px] text-foreground py-1.5 pr-2">{truncateId(s.id)}</td>
                      <td className="font-body text-[12px] text-muted-foreground py-1.5 pr-2">Message flagged</td>
                      <td className="font-body text-[12px] text-muted-foreground py-1.5 pr-2">{formatDate(s.created_at)}</td>
                      <td className="py-1.5">
                        <EchoButton variant="outline" size="sm" onClick={() => openTranscript(s.id)}>
                          Review
                        </EchoButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ── Transcript Viewer (Flagged) ── */}
        {activeSection === "flagged" && viewingSessionId && (
          <section>
            <button
              onClick={() => setViewingSessionId(null)}
              className="font-body text-[11px] text-foreground underline echo-fade mb-3 block"
            >
              ← Back to flagged sessions
            </button>
            <h2 className="font-display text-[24px] leading-tight mb-2">
              Transcript — {truncateId(viewingSessionId)}
            </h2>
            {transcriptLoading ? (
              <p className="font-body text-[13px] text-muted-foreground">{t("common.loading")}</p>
            ) : transcript.length === 0 ? (
              <p className="font-body text-[13px] text-muted-foreground">No messages in this session.</p>
            ) : (
              <div className="border border-foreground p-3 max-h-[500px] overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
                {transcript.map((msg) => (
                  <div key={msg.id} className={`mb-2 ${msg.flagged ? "border-l-2 border-foreground pl-2" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                        {truncateId(msg.sender_id)}
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground">
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.flagged && (
                        <span className="font-body text-[10px] bg-foreground text-background px-1">FLAGGED</span>
                      )}
                    </div>
                    <p className="font-body text-[13px] text-foreground mt-0.5">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Random Review ── */}
        {activeSection === "random" && (
          <section>
            <h2 className="font-display text-[28px] leading-tight mb-3">Random Session Review</h2>

            {!randomSession && (
              <EchoButton variant="solid" size="md" onClick={pullRandom} disabled={randomLoading}>
                {randomLoading ? "Pulling..." : "Pull Random Session for Review"}
              </EchoButton>
            )}

            {randomSession && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-body text-[12px] text-muted-foreground">
                    Session: {truncateId(randomSession.id)} · {formatDate(randomSession.created_at)}
                  </span>
                  <EchoButton variant="outline" size="sm" onClick={pullRandom}>
                    Pull Another
                  </EchoButton>
                </div>

                {/* Transcript */}
                <div className="border border-foreground p-3 max-h-[400px] overflow-y-auto mb-4" style={{ overscrollBehavior: "contain" }}>
                  {randomTranscript.length === 0 ? (
                    <p className="font-body text-[13px] text-muted-foreground">No messages.</p>
                  ) : (
                    randomTranscript.map((msg) => (
                      <div key={msg.id} className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                            {truncateId(msg.sender_id)}
                          </span>
                          <span className="font-body text-[10px] text-muted-foreground">
                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="font-body text-[13px] text-foreground mt-0.5">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Evaluation Form */}
                {!evalSubmitted ? (
                  <div className="border border-foreground p-4">
                    <h3 className="font-display text-[20px] leading-tight mb-3">Evaluation</h3>
                    <div className="flex flex-col gap-1.5">
                      {EVAL_FLAGS.map((flag) => (
                        <label key={flag} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={evalFlags.includes(flag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEvalFlags([...evalFlags, flag]);
                              } else {
                                setEvalFlags(evalFlags.filter((f) => f !== flag));
                              }
                            }}
                            className="mt-[3px] accent-foreground"
                          />
                          <span className="font-body text-[12px] text-foreground">{flag}</span>
                        </label>
                      ))}
                    </div>

                    <textarea
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      placeholder="Additional notes (optional)..."
                      className="w-full border border-foreground bg-background px-2 py-1.5 font-body text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none mt-3"
                      rows={3}
                    />

                    <div className="mt-3">
                      <EchoButton
                        variant="solid"
                        size="md"
                        onClick={submitEvaluation}
                        disabled={evalFlags.length === 0 || submittingEval}
                        className={evalFlags.length === 0 ? "opacity-40 cursor-not-allowed" : ""}
                      >
                        {submittingEval ? "Submitting..." : "Submit Evaluation"}
                      </EchoButton>
                    </div>
                  </div>
                ) : (
                  <div className="border border-foreground p-4">
                    <p className="font-body text-[13px] text-foreground">
                      ● Evaluation submitted. Thank you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Listener Overview ── */}
        {activeSection === "overview" && !listenerProfile && (
          <section>
            <h2 className="font-display text-[28px] leading-tight mb-3">Listener Quality Overview</h2>
            {listeners.length === 0 ? (
              <p className="font-body text-[13px] text-muted-foreground">{t("common.loading")}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground">
                    {["Listener", "Total Sessions", "Flagged", "Eval Flags", ""].map((h) => (
                      <th key={h} className="font-body text-[10px] uppercase tracking-widest text-muted-foreground text-left py-1 pr-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listeners.map((l) => (
                    <tr key={l.user_id} className="border-b border-secondary">
                      <td className="font-body text-[12px] text-foreground py-1.5 pr-2">
                        {l.username || truncateId(l.user_id)}
                      </td>
                      <td className="font-body text-[12px] text-muted-foreground py-1.5 pr-2">{l.totalSessions}</td>
                      <td className="font-body text-[12px] text-muted-foreground py-1.5 pr-2">{l.flaggedSessions}</td>
                      <td className="font-body text-[12px] text-muted-foreground py-1.5 pr-2">{l.evaluationFlags}</td>
                      <td className="py-1.5">
                        <EchoButton variant="outline" size="sm" onClick={() => viewListenerProfile(l.user_id)}>
                          View Profile
                        </EchoButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* ── Listener Profile ── */}
        {activeSection === "overview" && listenerProfile && (
          <section>
            <button
              onClick={() => setListenerProfile(null)}
              className="font-body text-[11px] text-foreground underline echo-fade mb-3 block"
            >
              ← Back to overview
            </button>
            <h2 className="font-display text-[28px] leading-tight mb-1">
              {listenerProfile.username || truncateId(listenerProfile.user_id)}
            </h2>

            <div className="flex flex-col gap-2 mt-3">
              <div className="grid grid-cols-2 gap-0">
                <div className="border border-foreground p-3">
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Sessions</span>
                  <p className="font-display text-[28px] leading-none mt-1">{listenerProfile.sessionCount}</p>
                </div>
                <div className="border border-foreground p-3">
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Formation Score</span>
                  <p className="font-display text-[28px] leading-none mt-1">
                    {listenerProfile.formationScore ?? "—"}
                  </p>
                </div>
              </div>

              {listenerProfile.badgeDate && (
                <p className="font-body text-[12px] text-muted-foreground">
                  ● Certified: {formatDate(listenerProfile.badgeDate)}
                </p>
              )}

              {listenerProfile.bio && (
                <div className="border border-foreground p-3">
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Bio</span>
                  <p className="font-body text-[13px] text-foreground mt-1">{listenerProfile.bio}</p>
                </div>
              )}

              {listenerProfile.evalFlags.length > 0 && (
                <div className="border border-foreground p-3">
                  <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Evaluation Flags Received</span>
                  <ul className="mt-1">
                    {listenerProfile.evalFlags.map((f, i) => (
                      <li key={i} className="font-body text-[12px] text-foreground">— {f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {/* TODO: Implement warning email system */}
                <EchoButton variant="outline" size="sm" disabled className="opacity-40 cursor-not-allowed">
                  Issue Warning (TODO)
                </EchoButton>
                {/* TODO: Implement listener suspension */}
                <EchoButton variant="outline" size="sm" disabled className="opacity-40 cursor-not-allowed">
                  Suspend Listener (TODO)
                </EchoButton>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Moderation;
