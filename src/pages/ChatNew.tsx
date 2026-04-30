import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole } from "@/lib/resolve-role";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoLogo } from "@/components/echo/EchoLogo";

interface ActiveRequest {
  id: string;
  session_id: string | null;
  status: string;
}

const ChatNew = () => {
  const navigate = useNavigate();
  const db = supabase as any;
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<"seeker" | "listener" | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [request, setRequest] = useState<ActiveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const resolvedRole = await resolveUserRole(user.id);
      if (resolvedRole === "listener") {
        navigate("/listen", { replace: true });
        return;
      }
      if (resolvedRole !== "seeker") {
        navigate("/onboarding", { replace: true });
        return;
      }

      setUserId(user.id);
      setRole("seeker");
      const requestId = new URLSearchParams(window.location.search).get("request");
      if (requestId) {
        const { data } = await db
          .from("chat_requests")
          .select("id, session_id, status")
          .eq("id", requestId)
          .eq("seeker_id", user.id)
          .maybeSingle();
        if (data?.status === "active" && data.session_id) {
          navigate(`/chat/${data.session_id}`, { replace: true });
          return;
        }
        if (data) setRequest(data as ActiveRequest);
      }
      setLoading(false);
    };

    init();
  }, [navigate]);

  useEffect(() => {
    if (!request?.id) return;

    const channel = supabase
      .channel(`chat-request:${request.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_requests",
          filter: `id=eq.${request.id}`,
        },
        (payload) => {
          const next = payload.new as ActiveRequest;
          setRequest(next);
          if (next.status === "active" && next.session_id) {
            navigate(`/chat/${next.session_id}`, { replace: true });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request?.id, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !title.trim() || !topic.trim() || submitting) return;

    setSubmitting(true);
    setError("");

    const { data, error: insertError } = await db
      .from("chat_requests")
      .insert({
        seeker_id: userId,
        title: title.trim(),
        topic: topic.trim(),
        status: "pending",
      })
      .select("id, session_id, status")
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Could not create request.");
      setSubmitting(false);
      return;
    }

    setRequest(data as ActiveRequest);
    setSubmitting(false);
  };

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <EchoLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-3">
        <div className="w-full max-w-[520px]">
          {request ? (
            <div className="border border-foreground p-5 text-center">
              <h1 className="font-body text-[20px] font-medium">Your request is live.</h1>
              <p className="font-body text-[12px] text-muted-foreground mt-3">
                A Listener will arrive when they accept it. This page will move you into the room automatically.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-foreground p-5">
              <h1 className="font-body text-[20px] font-medium">Request a Listener</h1>
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-body text-[11px] uppercase tracking-widest">Brief title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value.slice(0, 80))}
                    className="border border-foreground bg-background px-2 py-1 font-body text-[13px] outline-none"
                    placeholder="What this is about"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-body text-[11px] uppercase tracking-widest">Topic</span>
                  <textarea
                    value={topic}
                    onChange={(event) => setTopic(event.target.value.slice(0, 500))}
                    className="min-h-[120px] resize-none border border-foreground bg-background px-2 py-1 font-body text-[13px] outline-none"
                    placeholder="A few words are enough."
                    required
                  />
                </label>
              </div>

              {error && <p className="font-body text-[11px] text-foreground mt-3">{error}</p>}

              <EchoButton
                type="submit"
                variant="solid"
                size="md"
                disabled={!title.trim() || !topic.trim() || submitting}
                className="mt-4 disabled:opacity-40"
              >
                {submitting ? "Sending..." : "Send request"}
              </EchoButton>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatNew;
