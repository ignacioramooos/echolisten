import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  userId: string;
  isWaiting: boolean;
  isFocusMode?: boolean;
}

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderContent = (content: string) => {
  let html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<u>$1</u>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export const ChatMessages = ({ messages, userId, isWaiting, isFocusMode }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div
      className="overflow-y-auto px-3 py-4 flex flex-col h-full"
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="mx-auto w-full max-w-echo flex flex-col gap-3">
        {isWaiting && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-6">
            <div className="text-center">
              <p className={`font-body text-[16px] ${isFocusMode ? "text-background" : "text-foreground"}`}>
                <span className="">●</span> Finding an Echo...
              </p>
              <p className={`font-body text-[11px] mt-1 ${isFocusMode ? "text-background/60" : "text-muted-foreground"}`}>
                A trained Listener will be with you shortly.
              </p>
              <Link to="/aura" className={`font-body text-[11px] mt-2 underline block ${isFocusMode ? "text-background/60" : "text-muted-foreground"}`}>
                While you wait, you can talk to Aura.
              </Link>
            </div>

            <div className={`w-full max-w-[360px] border p-3 ${isFocusMode ? "border-background/30" : "border-foreground"}`}>
              <p className={`font-body text-[11px] uppercase tracking-[0.2em] mb-2 ${isFocusMode ? "text-background/60" : "text-muted-foreground"}`}>
                Community Guidelines
              </p>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Be honest, but kind. This is a safe space.",
                  "Listeners don't give advice. They listen.",
                  "Sessions are private and not stored.",
                  "Cor Ad Cor is not a crisis service. For emergencies, contact local services.",
                ].map((g) => (
                  <li key={g} className={`font-body text-[12px] ${isFocusMode ? "text-background" : "text-foreground"}`}>
                    — {g}
                  </li>
                ))}
              </ul>
            </div>
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
                className={`max-w-[75%] font-body text-[13px] leading-relaxed tracking-wide ${
                  isFocusMode
                    ? isMine
                      ? "text-right text-foreground bg-background px-2 py-1"
                      : "border-l border-background/40 pl-3 text-left text-background"
                    : isMine
                      ? "text-right"
                      : "border-l border-foreground pl-3 text-left"
                }`}
              >
                {renderContent(msg.content)}
              </div>
              <span className={`font-body text-[9px] mt-1 ${isFocusMode ? "text-background/40" : "text-muted-foreground"}`}>
                {formatTime(msg.sent_at)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
