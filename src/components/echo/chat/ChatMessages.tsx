import { useEffect, useRef } from "react";

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
}

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderContent = (content: string) => {
  // Parse simple markdown-like formatting: **bold**, *italic*, __underline__
  let html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<u>$1</u>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export const ChatMessages = ({ messages, userId, isWaiting }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-4 flex flex-col"
      style={{ overscrollBehavior: "contain" }}
    >
      <div className="mx-auto w-full max-w-echo flex flex-col gap-3">
        {isWaiting && (
          <div className="flex-1 flex items-center justify-center py-20">
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
                className={`max-w-[75%] font-body text-[13px] leading-relaxed tracking-wide ${
                  isMine
                    ? "text-right"
                    : "border-l border-foreground pl-3 text-left"
                }`}
              >
                {renderContent(msg.content)}
              </div>
              <span className="font-body text-[9px] text-muted-foreground mt-1">
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
