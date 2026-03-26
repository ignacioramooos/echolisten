import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";
import { CrisisBanner } from "@/components/echo/chat/CrisisBanner";
import { Bold, Italic, Underline } from "lucide-react";

interface AuraMessage {
  role: "user" | "assistant";
  content: string;
}

const AURA_OPENING = "Hi. I'm Aura, Echo's AI listener. I'm here for you right now. What's on your mind?";
const MAX_CHARS = 1000;
const MAX_EXCHANGES = 40;
const SESSION_MINUTES = 30;

const AuraChat = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [messages, setMessages] = useState<AuraMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // Check session limits
  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000 / 60;
      if (elapsed >= SESSION_MINUTES && !showConnectPrompt) {
        setShowConnectPrompt(true);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [startedAt, showConnectPrompt]);

  useEffect(() => {
    const exchanges = messages.filter((m) => m.role === "user").length;
    if (exchanges >= MAX_EXCHANGES && !showConnectPrompt) {
      setShowConnectPrompt(true);
    }
  }, [messages, showConnectPrompt]);

  const startSession = async () => {
    if (!userId) return;
    setAccepted(true);
    setStartedAt(Date.now());
    setMessages([{ role: "assistant", content: AURA_OPENING }]);

    const { data } = await supabase
      .from("aura_sessions")
      .insert({ seeker_id: userId, messages: [{ role: "assistant", content: AURA_OPENING }] } as any)
      .select("id")
      .single();

    if (data) setSessionId(data.id);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || crisisDetected) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const userMsg: AuraMessage = { role: "user", content };
    const updated = [...messages, userMsg];
    setMessages(updated);

    try {
      const { data, error } = await supabase.functions.invoke("aura-chat", {
        body: { messages: updated },
      });

      if (error || !data?.content) {
        setMessages([...updated, { role: "assistant", content: "I'm having trouble responding right now. Please try again." }]);
        setSending(false);
        return;
      }

      const auraContent: string = data.content;

      // Crisis detection
      if (auraContent.includes("[CRISIS_DETECTED]")) {
        setCrisisDetected(true);
        // Flag in DB
        if (sessionId) {
          await supabase
            .from("aura_sessions")
            .update({ flagged: true, messages: [...updated] as any })
            .eq("id", sessionId);
        }
        setSending(false);
        return;
      }

      const allMessages = [...updated, { role: "assistant" as const, content: auraContent }];
      setMessages(allMessages);

      // Persist to DB
      if (sessionId) {
        await supabase
          .from("aura_sessions")
          .update({ messages: allMessages as any })
          .eq("id", sessionId);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setSending(false);
  }, [input, sending, messages, sessionId, crisisDetected]);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.substring(start, end);
    const newVal = input.substring(0, start) + prefix + selected + suffix + input.substring(end);
    if (newVal.length <= MAX_CHARS) {
      setInput(newVal);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    }
  }, [input]);

  const renderContent = (content: string) => {
    let html = content
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/__(.+?)__/g, "<u>$1</u>");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const formatTime = (index: number) => {
    // Simple time display based on message position
    return "";
  };

  // Disclaimer screen
  if (!accepted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-foreground px-3 py-1.5">
          <span className="font-display italic text-[16px]">● Aura — AI Listener</span>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-[440px] border border-foreground p-6">
            <h1 className="font-display text-[28px] leading-tight mb-4">Before we begin.</h1>
            <div className="flex flex-col gap-3">
              <p className="font-body text-[13px] leading-relaxed">
                Aura is an AI assistant, not a human, not a therapist, and not a crisis service.
              </p>
              <p className="font-body text-[13px] leading-relaxed">
                Aura can listen and reflect — nothing more. If you are in danger, call emergency services now.
              </p>
            </div>
            <div className="mt-6">
              <EchoButton variant="solid" size="md" onClick={startSession}>
                I understand — continue
              </EchoButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="bg-foreground text-background px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <span className="font-display italic text-[16px]">● Aura — AI Listener</span>
        <EchoButton
          variant="outline"
          size="sm"
          onClick={async () => {
            if (sessionId) {
              await supabase
                .from("aura_sessions")
                .update({ ended_at: new Date().toISOString() } as any)
                .eq("id", sessionId);
            }
            navigate("/dashboard");
          }}
          className="border-background text-background hover:bg-background hover:text-foreground"
        >
          End
        </EchoButton>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ maxHeight: "calc(100vh - 180px)", overscrollBehavior: "contain" }}
      >
        <div className="mx-auto w-full max-w-echo flex flex-col gap-3">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] font-body text-[13px] leading-relaxed tracking-wide ${
                    isUser ? "text-right" : "border-l border-foreground pl-3 text-left"
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex flex-col items-start">
              <div className="font-body text-[13px] text-muted-foreground border-l border-foreground pl-3">
                <span className="echo-pulse">●</span> Aura is thinking...
              </div>
            </div>
          )}

          {/* Connect prompt */}
          {showConnectPrompt && !crisisDetected && (
            <div className="border border-foreground p-3 mt-2">
              <p className="font-body text-[13px] text-foreground">
                We've talked for a while. Would you like to connect with a human Echo Listener? Sometimes talking to another person makes all the difference.
              </p>
              <div className="mt-2">
                <Link to="/chat/new">
                  <EchoButton variant="solid" size="sm">
                    Connect with Listener →
                  </EchoButton>
                </Link>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Crisis banner */}
      {crisisDetected && (
        <>
          <CrisisBanner />
          <div className="border-t border-foreground px-3 py-3 flex-shrink-0">
            <p className="font-body text-[13px] text-foreground text-center">
              Aura has paused this conversation. Please contact a crisis service.
            </p>
          </div>
        </>
      )}

      {/* Input */}
      {!crisisDetected && (
        <div className="border-t border-foreground flex-shrink-0">
          <div className="mx-auto w-full max-w-echo flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-1">
              {[
                { fn: () => insertFormat("**", "**"), icon: <Bold size={12} />, title: "Bold" },
                { fn: () => insertFormat("*", "*"), icon: <Italic size={12} />, title: "Italic" },
                { fn: () => insertFormat("__", "__"), icon: <Underline size={12} />, title: "Underline" },
              ].map((btn) => (
                <button
                  key={btn.title}
                  onClick={btn.fn}
                  className="p-1 border border-foreground text-muted-foreground hover:text-foreground echo-fade font-body text-[11px]"
                  title={btn.title}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
            <span className="font-body text-[10px] text-muted-foreground">
              {input.length} / {MAX_CHARS}
            </span>
          </div>
          <div className="mx-auto w-full max-w-echo flex items-end px-3 pb-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 8 * 24) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              rows={3}
              className="flex-1 py-2 font-body text-[13px] leading-relaxed tracking-wide text-foreground bg-background outline-none resize-none placeholder:text-muted-foreground"
            />
            <EchoButton
              variant="solid"
              size="sm"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`flex-shrink-0 ml-2 mb-1 ${sending || !input.trim() ? "opacity-40" : ""}`}
            >
              Send
            </EchoButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuraChat;
