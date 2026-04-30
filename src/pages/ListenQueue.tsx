import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoLogo } from "@/components/echo/EchoLogo";

interface WaitingSession {
  id: string;
  title: string;
  topic: string;
  created_at: string;
}

const ListenQueue = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<WaitingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const loadSessions = async () => {
    const { data } = await supabase
      .from("chat_requests")
      .select("id, title, topic, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (data) setSessions(data as WaitingSession[]);
    setLoading(false);
  };

  useEffect(() => {
    // Auth guard: must be authenticated listener with badge
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("listener_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) { navigate("/login", { replace: true }); return; }

      const { data: progress } = await supabase
        .from("formation_progress")
        .select("bot_passed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!progress?.bot_passed) { navigate("/dashboard/listener"); return; }

      loadSessions();
    };
    check();

    const channel = supabase
      .channel("waiting-sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_requests" }, () => loadSessions())
      .subscribe();

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [navigate]);

  const handlePickUp = async (sessionId: string) => {
    setPicking(sessionId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const { data, error } = await supabase.rpc("accept_chat_request", {
      request_id: sessionId,
    });

    if (error || !data) {
      console.error("Failed to claim session:", error);
      setPicking(null);
      loadSessions();
      return;
    }
    navigate(`/chat/${data}`);
  };

  const getWaitTime = (createdAt: string) => {
    const diff = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${String(secs).padStart(2, "0")}s`;
  };

  const getWaitSeconds = (createdAt: string) =>
    Math.floor((now - new Date(createdAt).getTime()) / 1000);

  const getBorderWeight = (createdAt: string) => {
    const secs = getWaitSeconds(createdAt);
    if (secs > 900) return "border-[3px]";
    if (secs > 300) return "border-2";
    return "border";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <EchoLogo />
        <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
          {t("queue.title")}
        </span>
      </header>

      <div className="flex-1 px-2 py-3 mx-auto w-full max-w-echo">
        <h1 className="font-display text-[32px] leading-tight text-foreground">
          {t("queue.heading")}
        </h1>

        {!loading && sessions.length > 0 && (
          <p className="font-body text-[11px] text-muted-foreground mt-1">
            ● {sessions.length} {sessions.length === 1 ? "person" : "people"} waiting. Select from the top for priority.
          </p>
        )}

        <div className="mt-3 flex flex-col gap-1">
          {loading && (
            <p className="font-body text-[13px] text-muted-foreground">{t("queue.loading")}</p>
          )}

          {!loading && sessions.length === 0 && (
            <p className="font-body text-[13px] text-muted-foreground">
              {t("queue.noOneWaiting")}
            </p>
          )}

              {sessions.map((s) => (
            <div
              key={s.id}
              className={`${getBorderWeight(s.created_at)} border-foreground py-2 px-2 flex items-center justify-between gap-2`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-body text-[11px] bg-foreground text-background px-1.5 py-0.5 inline-block">
                    Waiting {getWaitTime(s.created_at)}
                  </span>
                  <span className="font-body text-[10px] text-muted-foreground">pending</span>
                </div>
                <p className="font-body text-[13px] text-foreground truncate">{s.title}</p>
                <p className="font-body text-[12px] text-muted-foreground truncate">
                  {s.topic}
                </p>
              </div>
              <EchoButton
                variant="outline"
                size="sm"
                onClick={() => handlePickUp(s.id)}
                disabled={picking === s.id}
                className={picking === s.id ? "opacity-40" : ""}
              >
                {picking === s.id ? "Joining..." : "Accept Session"}
              </EchoButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListenQueue;
