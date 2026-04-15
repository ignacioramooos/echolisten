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
import { EchoAdvisor } from "@/components/echo/chat/EchoAdvisor";
import { CrisisInfoOverlay } from "@/components/echo/chat/CrisisInfoOverlay";
import { SharedJournalCard } from "@/components/echo/chat/SharedJournalCard";
import { toast } from "sonner";
import { EchoButton } from "@/components/echo/EchoButton";

const GRACEFUL_EXIT_MSG =
  "I've valued our 10 minutes, but I need to step away to recharge now. You did great sharing today.";

const ChatRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useRealtimeSession(sessionId);
  const { messages, loading: messagesLoading } = useRealtimeMessages(sessionId);

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [kicked, setKicked] = useState(false);
  const [showCrisisInfo, setShowCrisisInfo] = useState(false);
  const [showSharedCard, setShowSharedCard] = useState(true);

  const isSeeker = session?.seeker_id === userId;
  const isListener = session?.listener_id === userId;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);
      // Role determined by session participation, not metadata
      const { data: lp } = await supabase.from("listener_profiles").select("id").eq("user_id", user.id).maybeSingle();
      setUserRole(lp ? "listener" : "seeker");
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
    }
  }, [input]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (detectCrisisKeywords(lastMsg.content)) {
        setShowCrisisBanner(true);
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !sessionId || !userId || kicked) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const modResult = await moderateContent(content, isSeeker ? "seeker" : "room");

    if (modResult.flagged) {
      if (modResult.action === "crisis_alert") {
        setShowCrisisBanner(true);
      } else if (modResult.action === "kick") {
        const strikeAction = applyStrike(userId);
        if (strikeAction === "warn_silent") {
          console.warn("Strike 1 for user", userId, modResult.triggeredCategories);
        } else if (strikeAction === "warn_visible") {
          toast.warning("Your message may violate community guidelines. Please be respectful.");
        } else if (strikeAction === "kick") {
          setKicked(true);
          await supabase.from("messages").insert({
            session_id: sessionId,
            sender_id: userId,
            content: "[System] A user was removed for violating community guidelines.",
          });
          await supabase.from("sessions").update({ status: "ended" as const }).eq("id", sessionId);
          setSending(false);
          return;
        }
      }
    }

    await supabase.from("messages").insert({
      session_id: sessionId,
      sender_id: userId,
      content,
    });
    setSending(false);
  }, [input, sending, sessionId, userId, kicked, isSeeker]);

  const handleEndSession = async () => {
    if (!sessionId || !userId) return;
    if (isListener) {
      await supabase.from("messages").insert({
        session_id: sessionId,
        sender_id: userId,
        content: GRACEFUL_EXIT_MSG,
      });
    }
    await supabase.from("sessions").update({ status: "ended" as const }).eq("id", sessionId);
  };

  const handleTimeUp = useCallback(async () => {
    if (!sessionId) return;
    await supabase.from("sessions").update({ status: "ended" as const }).eq("id", sessionId);
  }, [sessionId]);

  const handleBlockUser = async () => {
    toast.info("User blocked. Session flagged for admin review.");
    await handleEndSession();
  };

  const handleFlagSession = (reason: string) => {
    toast.info(`Session flagged: ${reason}`);
    // Future: store flags in DB
  };

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

  if (kicked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-display text-[28px] text-foreground">Session Ended</p>
          <p className="font-body text-[13px] text-muted-foreground mt-2">
            You've been removed from this room for violating community guidelines.
          </p>
          <EchoButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/")}>
            Return Home
          </EchoButton>
        </div>
      </div>
    );
  }

  if (isEnded) {
    return <SessionEndScreen isSeeker={isSeeker} sessionId={sessionId!} userId={userId} />;
  }

  return (
    <div
      className={`flex flex-col ${
        isFocusMode
          ? "fixed inset-0 z-50 bg-foreground text-background"
          : "min-h-screen bg-background text-foreground"
      }`}
    >
      <ChatHeader
        isWaiting={isWaiting}
        isFocusMode={isFocusMode}
        isListener={isListener}
        onToggleFocus={() => setIsFocusMode((f) => !f)}
        onEndSession={handleEndSession}
        onShowCrisisInfo={() => setShowCrisisInfo(true)}
        onBlockUser={handleBlockUser}
        onFlagSession={handleFlagSession}
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

      {/* Main chat area: messages + optional advisor */}
      <div
        className="flex flex-1 min-h-0 relative"
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        {/* Crisis info overlay */}
        {showCrisisInfo && <CrisisInfoOverlay onClose={() => setShowCrisisInfo(false)} />}

        {/* Messages container with isolated scroll */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <div
            className="flex-1 overflow-y-auto"
            style={{ overscrollBehavior: "contain" }}
          >
            <ChatMessages
              messages={messages}
              userId={userId}
              isWaiting={isWaiting}
              isFocusMode={isFocusMode}
            />
          </div>
        </div>

        {/* Listener-only advisor panel */}
        {isListener && !isWaiting && session.listener_id && (
          <EchoAdvisor
            messages={messages}
            listenerId={session.listener_id}
            seekerId={session.seeker_id}
          />
        )}
      </div>

      {/* Crisis banner */}
      {showCrisisBanner && <CrisisBanner />}

      {/* Waiting state — role-specific */}
      {isWaiting && (
        <div className="flex-1 flex items-center justify-center px-4">
          {isSeeker ? (
            <div className="text-center">
              <p className="font-display text-[24px] text-foreground">Waiting for a Listener…</p>
              <p className="font-body text-[13px] text-muted-foreground mt-2">
                A trained Listener will accept your session shortly. You'll be connected automatically.
              </p>
            </div>
          ) : isListener ? (
            <div className="text-center">
              <p className="font-display text-[20px] text-foreground">Connecting…</p>
              <p className="font-body text-[13px] text-muted-foreground mt-1">
                Setting up the session. You'll be connected in a moment.
              </p>
            </div>
          ) : (
            <p className="font-body text-[13px] text-muted-foreground">Loading session…</p>
          )}
        </div>
      )}

      {/* Input area */}
      {!isWaiting ? (
        <ChatInput
          input={input}
          setInput={setInput}
          sending={sending}
          onSend={handleSend}
          isFocusMode={isFocusMode}
        />
      ) : isListener ? (
        <div className="border-t border-foreground/10 px-2 py-3">
          <p className="font-body text-[12px] text-muted-foreground text-center">
            Establishing connection…
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ChatRoom;
