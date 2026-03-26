import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";

interface EchoAdvisorProps {
  messages: { sender_id: string; content: string }[];
  listenerId: string;
  seekerId: string;
}

export const EchoAdvisor = ({ messages, listenerId, seekerId }: EchoAdvisorProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);
    setFeedbackGiven(false);

    const formatted = messages.slice(-6).map((m) => ({
      role: m.sender_id === listenerId ? "listener" : "seeker",
      content: m.content,
    }));

    try {
      const { data, error } = await supabase.functions.invoke("echo-advisor", {
        body: { messages: formatted },
      });

      if (error || !data?.suggestion) {
        setSuggestion("Unable to generate suggestion right now.");
      } else {
        setSuggestion(data.suggestion);
      }
    } catch {
      setSuggestion("Unable to generate suggestion right now.");
    }
    setLoading(false);
  };

  if (collapsed) {
    return (
      <div className="border-l border-foreground flex-shrink-0 w-[48px] flex flex-col items-center pt-2">
        <button
          onClick={() => setCollapsed(false)}
          className="text-muted-foreground hover:text-foreground echo-fade p-1"
          title="Open Echo Advisor"
        >
          <ChevronDown size={14} />
        </button>
        <span className="font-body text-[9px] text-muted-foreground mt-1 writing-mode-vertical" style={{ writingMode: "vertical-rl" }}>
          Advisor
        </span>
      </div>
    );
  }

  return (
    <div className="border-l border-foreground flex-shrink-0 w-[240px] flex flex-col">
      {/* Header */}
      <div className="border-b border-foreground px-2 py-1.5 flex items-center justify-between">
        <span className="font-body text-[11px] uppercase tracking-widest text-foreground">
          ● Echo Advisor
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground echo-fade p-0.5"
        >
          <ChevronUp size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!suggestion && !loading && (
          <p className="font-body text-[11px] text-muted-foreground mb-2">
            Get an AI-powered suggestion for your next response.
          </p>
        )}

        {loading && (
          <p className="font-body text-[11px] text-muted-foreground">
            <span className="echo-pulse">●</span> Thinking...
          </p>
        )}

        {suggestion && (
          <div className="border border-foreground p-2 mb-2">
            <p className="font-body text-[12px] text-foreground leading-relaxed">
              {suggestion}
            </p>
          </div>
        )}

        {suggestion && !feedbackGiven && (
          <div className="flex items-center gap-1 mb-2">
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1 border border-foreground text-foreground hover:bg-foreground hover:text-background echo-fade"
              title="Helpful"
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1 border border-foreground text-muted-foreground hover:bg-foreground hover:text-background echo-fade"
              title="Not helpful"
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}

        {feedbackGiven && (
          <p className="font-body text-[10px] text-muted-foreground mb-2">Thanks for the feedback.</p>
        )}
      </div>

      {/* Action */}
      <div className="border-t border-foreground px-2 py-2">
        <EchoButton
          variant="outline"
          size="sm"
          onClick={getSuggestion}
          disabled={loading}
          className={`w-full ${loading ? "opacity-40" : ""}`}
        >
          {loading ? "Generating..." : "Get Suggestion"}
        </EchoButton>
      </div>
    </div>
  );
};
