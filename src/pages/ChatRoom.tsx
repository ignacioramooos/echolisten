import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeMessages, useRealtimeSession } from "@/hooks/use-realtime-chat";
import { detectCrisisKeywords } from "@/lib/crisis-detector";
import { moderateContent, applyStrike } from "@/lib/moderate";
import { CrisisBanner } from "@/components/echo/chat/CrisisBanner";
import { SessionEndScreen } from "@/components/echo/chat/SessionEndScreen";
import { ChatHeader } from "@/components/echo/chat/ChatHeader";
import { ChatMessages } from "@/components/echo/chat/ChatMessages";
import { ChatInput } from "@/components/echo/chat/ChatInput";
import { ChatTimer } from "@/components/echo/chat/ChatTimer";
import { toast } from "sonner";

const GRACEFUL_EXIT_MSG =
  "I've valued our 10 minutes, but I need to step away to recharge now. You did great sharing today.";

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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  // Start timer when session becomes active
  useEffect(() => {
    if (!session || !sessionId) return;
    if (session.status === "active" && !session.timer_end_at) {
      const endAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      supabase
        .from("sessions")
        .update({ timer_end_at: endAt } as any)
        .eq("id", sessionId)
        .then();
    }
  }, [session?.status, session?.timer_end_at, sessionId]);

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

  // Crisis detection
  useEffect(() => {
    if (detectCrisisKeywords(input)) {
      setShowCrisisBanner(true);
      setCrisisDismissed(false);
    }
  }, [input]);

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
    await supabase.from("messages").insert({
      session_id: sessionId,
      sender_id: userId,
      content,
    });
    setSending(false);
  }, [input, sending, sessionId, userId]);

  const handleEndSession = async () => {
    if (!sessionId || !userId) return;
    const isListener = session?.listener_id === userId;

    // Graceful exit: listener sends auto-message
    if (isListener) {
      await supabase.from("messages").insert({
        session_id: sessionId,
        sender_id: userId,
        content: GRACEFUL_EXIT_MSG,
      });
    }

    await supabase
      .from("sessions")
      .update({ status: "ended" as const })
      .eq("id", sessionId);
  };

  const handleTimeUp = useCallback(async () => {
    if (!sessionId) return;
    await supabase
      .from("sessions")
      .update({ status: "ended" as const })
      .eq("id", sessionId);
  }, [sessionId]);

  const isSeeker = session?.seeker_id === userId;
  const isWaiting = session?.status === "waiting";
  const isEnded = session?.status === "ended";

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
    <div className={`bg-background text-foreground flex flex-col ${
      isFocusMode ? "fixed inset-0 z-50" : "min-h-screen"
    }`}>
      <ChatHeader
        isWaiting={isWaiting}
        isFocusMode={isFocusMode}
        onToggleFocus={() => setIsFocusMode((f) => !f)}
        onEndSession={handleEndSession}
      />

      {/* Timer */}
      {!isWaiting && session.timer_end_at && userId && (
        <ChatTimer
          sessionId={sessionId!}
          timerEndAt={session.timer_end_at}
          extensionsUsed={session.extensions_used ?? 0}
          extendVotes={session.extend_votes ?? []}
          userId={userId}
          onTimeUp={handleTimeUp}
        />
      )}

      {/* Messages — fixed height with isolated scroll */}
      <div className={`flex-1 min-h-0 ${isFocusMode ? "" : "h-[600px] max-h-[calc(100vh-200px)]"}`}>
        <ChatMessages messages={messages} userId={userId} isWaiting={isWaiting} />
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
        <ChatInput
          input={input}
          setInput={setInput}
          sending={sending}
          onSend={handleSend}
        />
      )}
    </div>
  );
};

export default ChatRoom;
