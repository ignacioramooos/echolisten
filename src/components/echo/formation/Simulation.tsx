import { useState, useRef, useEffect } from "react";
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

const Simulation = ({ onComplete }: SimulationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial bot greeting
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
        // Small delay so user sees last message
        setTimeout(() => onComplete(evalResult), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "60vh" }}>
      {/* Header */}
      <div className="bg-foreground text-background px-2 py-1 flex items-center justify-between">
        <span className="font-display italic text-[16px]">
          ● Echo — Formation Simulation
        </span>
        <span className="font-body text-[11px] uppercase tracking-widest">Active</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border-l border-r border-foreground p-2 flex flex-col gap-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-1 py-1 font-body text-[13px] border border-foreground ${
                msg.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-1 py-1 font-body text-[13px] text-muted-foreground">
              Sam is typing...
            </div>
          </div>
        )}
        {error && (
          <p className="font-body text-[11px] text-foreground text-center">⚠ {error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border border-foreground flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your response..."
          className="flex-1 px-1 py-1 font-body text-[13px] text-foreground bg-background outline-none placeholder:text-muted-foreground"
          disabled={loading}
        />
        <EchoButton
          variant="solid"
          size="sm"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={loading || !input.trim() ? "opacity-40" : ""}
        >
          Send
        </EchoButton>
      </div>
    </div>
  );
};

export { Simulation };
