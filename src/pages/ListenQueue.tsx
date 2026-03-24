import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoLogo } from "@/components/echo/EchoLogo";

interface WaitingSession {
  id: string;
  topic_snippet: string | null;
  created_at: string;
}

const ListenQueue = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<WaitingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<string | null>(null);

  const loadSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("id, topic_snippet, created_at")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    if (data) setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();

    // Subscribe to new waiting sessions
    const channel = supabase
      .channel("waiting-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePickUp = async (sessionId: string) => {
    setPicking(sessionId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { error } = await supabase
      .from("sessions")
      .update({ listener_id: user.id, status: "active" as const })
      .eq("id", sessionId)
      .eq("status", "waiting");

    if (error) {
      setPicking(null);
      return;
    }

    navigate(`/chat/${sessionId}`);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <EchoLogo />
        <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
          Listener Queue
        </span>
      </header>

      <div className="flex-1 px-2 py-3 mx-auto w-full max-w-echo">
        <h1 className="font-display text-[32px] leading-tight text-foreground">
          Someone needs you.
        </h1>
        <p className="font-body text-[13px] text-muted-foreground mt-1">
          Pick up a session to begin listening.
        </p>

        <div className="mt-3 flex flex-col">
          {loading && (
            <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
          )}

          {!loading && sessions.length === 0 && (
            <p className="font-body text-[13px] text-muted-foreground">
              No one is waiting right now. Check back soon.
            </p>
          )}

          {sessions.map((s) => (
            <div
              key={s.id}
              className="border-b border-foreground py-2 flex items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <span className="font-body text-[11px] text-muted-foreground">
                  {formatTime(s.created_at)}
                </span>
                <p className="font-body text-[13px] text-foreground truncate mt-0.5">
                  {s.topic_snippet || "No preview available"}
                </p>
              </div>
              <EchoButton
                variant="outline"
                size="sm"
                onClick={() => handlePickUp(s.id)}
                disabled={picking === s.id}
                className={picking === s.id ? "opacity-40" : ""}
              >
                {picking === s.id ? "Joining..." : "Begin Session"}
              </EchoButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListenQueue;
