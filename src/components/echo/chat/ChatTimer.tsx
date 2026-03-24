import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatTimerProps {
  sessionId: string;
  timerEndAt: string | null;
  extensionsUsed: number;
  extendVotes: string[];
  userId: string;
  onTimeUp: () => void;
}

export const ChatTimer = ({
  sessionId,
  timerEndAt,
  extensionsUsed,
  extendVotes,
  userId,
  onTimeUp,
}: ChatTimerProps) => {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showExtendPrompt, setShowExtendPrompt] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setHasVoted(extendVotes.includes(userId));
  }, [extendVotes, userId]);

  useEffect(() => {
    if (!timerEndAt) return;

    const tick = () => {
      const end = new Date(timerEndAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setRemaining(diff);

      if (diff <= 60 && diff > 0 && extensionsUsed < 2) {
        setShowExtendPrompt(true);
      } else if (diff > 60) {
        setShowExtendPrompt(false);
      }

      if (diff === 0) {
        onTimeUp();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerEndAt, extensionsUsed, onTimeUp]);

  const handleVoteExtend = useCallback(async () => {
    if (hasVoted || !sessionId) return;
    const newVotes = [...extendVotes, userId];

    if (newVotes.length >= 2) {
      // Both voted — extend by 5 minutes and reset votes
      const newEnd = new Date(new Date(timerEndAt!).getTime() + 5 * 60 * 1000).toISOString();
      await supabase
        .from("sessions")
        .update({
          timer_end_at: newEnd,
          extensions_used: extensionsUsed + 1,
          extend_votes: [],
        } as any)
        .eq("id", sessionId);
    } else {
      await supabase
        .from("sessions")
        .update({ extend_votes: newVotes } as any)
        .eq("id", sessionId);
    }
  }, [hasVoted, sessionId, extendVotes, userId, timerEndAt, extensionsUsed]);

  if (remaining === null) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isLow = remaining <= 60;

  return (
    <div className="flex-shrink-0">
      <div className="mx-auto w-full max-w-echo flex items-center justify-between px-3 py-1 border-b border-foreground">
        <span className={`font-body text-[11px] tracking-widest ${isLow ? "text-foreground" : "text-muted-foreground"}`}>
          {display}
        </span>
        {showExtendPrompt && extensionsUsed < 2 && (
          <div className="flex items-center gap-2">
            <span className="font-body text-[11px] text-muted-foreground">
              Extend +5 min? ({extendVotes.length}/2 accepted)
            </span>
            {!hasVoted ? (
              <button
                onClick={handleVoteExtend}
                className="font-body text-[11px] border border-foreground px-1 py-0.5 text-foreground hover:bg-foreground hover:text-background echo-fade"
              >
                Yes
              </button>
            ) : (
              <span className="font-body text-[11px] text-muted-foreground">Voted ●</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
