import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages, useRealtimeSession } from "@/hooks/use-realtime-chat";
import { detectCrisisKeywords } from "@/lib/crisis-detector";
import { CrisisBanner } from "@/components/echo/chat/CrisisBanner";
import { EchoButton } from "@/components/echo/EchoButton";
import { SessionEndScreen } from "@/components/echo/chat/SessionEndScreen";

const ChatRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useRealtimeSession(sessionId);
  const { messages, loading: messagesLoading } = useRealtimeMessages(sessionId);

  const [userId, setUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [crisisDismissed, setCrisisDismissed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  // Send opening message when session becomes active (for seeker)
  useEffect(() => {
    if (!session || !userId || !sessionId) return;
    if (session.status === "active" && session.seeker_id === userId) {
      const opening = sessionStorage.getItem(`echo-opening-${sessionId}`);
      if (opening) {
        sessionStorage.removeItem(`echo-opening-${sessionId}`);
        supabase.from("messages").insert({
          session_id: sessionId,
          sender_id: userId,
          content: opening,
        }).then();
      }
    }
  }, [session?.status, session?.seeker_id, userId, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // Crisis detection on input
  useEffect(() => {
    if (detectCrisisKeywords(input)) {
      setShowCrisisBanner(true);
      setCrisisDismissed(false);
    }
  }, [input]);

  // Crisis detection on incoming messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (detectCrisisKeywords(lastMsg.content)) {
        setShowCrisisBanner(true);
        setCrisisDismissed(false);
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !sessionId || !userId) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Auto-resize textarea back
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await supabase.from("messages").insert({
      session_id: sessionId,
      sender_id: userId,
      content,
    });

    setSending(false);
  }, [input, sending, sessionId, userId]);

  const handleEndSession = async () => {
    if (!sessionId) return;
    await supabase
      .from("sessions")
      .update({ status: "ended" as const })
      .eq("id", sessionId);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-expand
    const el = e.target;
    el.style.height = "auto";
    const maxHeight = 4 * 24; // ~4 rows
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const isSeeker = session?.seeker_id === userId;
  const isWaiting = session?.status === "waiting";
  const isEnded = session?.status === "ended";

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (sessionLoading || messagesLoading || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-foreground">Session not found.</p>
      </div>
    );
  }

  if (isEnded) {
    return <SessionEndScreen isSeeker={isSeeker} sessionId={sessionId!} userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="bg-foreground text-background px-2 py-1 flex items-center justify-between flex-shrink-0">
        <span className="font-display italic text-[16px]">
          ● Echo — {isWaiting ? "Waiting" : "Active Session"}
        </span>
        {!isWaiting && (
          <EchoButton
            variant="outline"
            size="sm"
            onClick={handleEndSession}
            className="border-background text-background hover:bg-background hover:text-foreground"
          >
            End Session
          </EchoButton>
        )}
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
        <div className="mx-auto w-full max-w-echo flex flex-col gap-1">
          {isWaiting && (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="font-body text-[14px] text-foreground">
                <span className="echo-pulse">●</span> Waiting for a Listener...
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] px-1 py-1 border border-foreground font-body text-[13px] ${
                    isMine
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="font-body text-[9px] text-muted-foreground mt-[2px]">
                  {formatTime(msg.sent_at)}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Crisis banner */}
      {showCrisisBanner && !crisisDismissed && (
        <CrisisBanner
          onDismiss={() => {
            setCrisisDismissed(true);
            setShowCrisisBanner(false);
          }}
        />
      )}

      {/* Input area */}
      {!isWaiting && (
        <div className="border-t border-foreground flex-shrink-0">
          <div className="mx-auto w-full max-w-echo flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              rows={2}
              className="flex-1 px-2 py-1 font-body text-[13px] text-foreground bg-background outline-none resize-none placeholder:text-muted-foreground"
            />
            <EchoButton
              variant="solid"
              size="sm"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`flex-shrink-0 ${sending || !input.trim() ? "opacity-40" : ""}`}
            >
              Send
            </EchoButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
