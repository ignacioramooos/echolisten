import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, Maximize2, Minimize2 } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";
import {
  sendToFormationBot,
  parseEvaluation,
  stripEvaluation,
  type Message,
  type EvalResult,
} from "@/lib/ai-client";

interface SimulationProps {
  onComplete: (result: EvalResult) => void;
}

const renderContent = (content: string) => {
  let html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<u>$1</u>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const Simulation = ({ onComplete }: SimulationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const content = await sendToFormationBot([]);
        setMessages([{ role: "assistant", content }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to start simulation");
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.substring(start, end);
    const newVal = input.substring(0, start) + prefix + selected + suffix + input.substring(end);
    setInput(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }, [input]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    const maxHeight = 8 * 24;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const content = await sendToFormationBot(updatedMessages);
      const evalResult = parseEvaluation(content);
      const displayContent = stripEvaluation(content);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: displayContent },
      ]);

      if (evalResult) {
        setTimeout(() => onComplete(evalResult), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <div className={`flex flex-col ${
      isFocusMode ? "fixed inset-0 z-50 bg-background" : "h-full"
    }`} style={{ minHeight: isFocusMode ? undefined : "60vh" }}>
      {/* Header */}
      <div className="bg-foreground text-background px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <span className="font-display italic text-[16px]">
          ● Echo — Formation Simulation
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFocusMode((f) => !f)}
            className="text-background hover:opacity-70 echo-fade p-1"
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <span className="font-body text-[11px] uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* Messages — scroll isolated */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col ${
          isFocusMode ? "" : "h-[500px] max-h-[calc(100vh-300px)]"
        }`}
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto w-full max-w-echo flex flex-col gap-3">
          {messages.map((msg, i) => {
            const isMine = msg.role === "user";
            return (
              <div
                key={i}
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
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <p className="font-body text-[13px] text-muted-foreground">
                <span className="echo-pulse">●</span> Sam is typing...
              </p>
            </div>
          )}
          {error && (
            <p className="font-body text-[11px] text-foreground text-center">⚠ {error}</p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Rich text toolbar + input */}
      <div className="border-t border-foreground flex-shrink-0">
        <div className="mx-auto w-full max-w-echo flex items-center gap-1 px-3 pt-2">
          <button
            onClick={() => insertFormat("**", "**")}
            className="p-1 text-muted-foreground hover:text-foreground echo-fade"
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => insertFormat("*", "*")}
            className="p-1 text-muted-foreground hover:text-foreground echo-fade"
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => insertFormat("__", "__")}
            className="p-1 text-muted-foreground hover:text-foreground echo-fade"
            title="Underline"
          >
            <Underline size={14} />
          </button>
        </div>

        <div className="mx-auto w-full max-w-echo flex items-end px-3 pb-2">
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
            placeholder="Type your response..."
            rows={2}
            disabled={loading}
            className="flex-1 py-2 font-body text-[13px] leading-relaxed tracking-wide text-foreground bg-background outline-none resize-none placeholder:text-muted-foreground"
          />
          <EchoButton
            variant="solid"
            size="sm"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`flex-shrink-0 ml-2 mb-1 ${loading || !input.trim() ? "opacity-40" : ""}`}
          >
            Send
          </EchoButton>
        </div>
      </div>
    </div>
  );
};

export { Simulation };
