import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, Maximize2, Minimize2 } from "lucide-react";
import {
  generateSimulation,
  evaluateFreeText,
  finalEvaluation,
  type SimTurn,
  type FinalEvalResult,
} from "@/lib/simulation-client";
import type { EvalResult } from "@/lib/ai-client";

interface SimulationProps {
  onComplete: (result: EvalResult) => void;
}

type TurnResponse = {
  turnIndex: number;
  response: string;
  correct: boolean;
  feedback: string;
};

type Phase =
  | "loading"
  | "active"
  | "evaluating-free-text"
  | "showing-feedback"
  | "retry-screen"
  | "restart-screen"
  | "final-evaluating"
  | "passed"
  | "failed";

const renderFormatted = (content: string) => {
  let html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<u>$1</u>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const Simulation = ({ onComplete }: SimulationProps) => {
  const [phase, setPhase] = useState<Phase>("loading");
  const [turns, setTurns] = useState<SimTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [responses, setResponses] = useState<TurnResponse[]>([]);
  const [retriesUsed, setRetriesUsed] = useState(0);
  const [freeTextInput, setFreeTextInput] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const isSubmitting = useRef(false);
  const [finalResult, setFinalResult] = useState<FinalEvalResult | null>(null);
  const [error, setError] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSimulation = useCallback(async () => {
    setPhase("loading");
    setError("");
    setCurrentTurn(0);
    setResponses([]);
    setCurrentFeedback(null);
    setFreeTextInput("");
    try {
      const newTurns = await generateSimulation();
      setTurns(newTurns);
      setPhase("active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate simulation");
      setPhase("active");
    }
  }, []);

  useEffect(() => { loadSimulation(); }, [loadSimulation]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "auto" });
  }, [responses, currentFeedback, currentTurn]);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = freeTextInput.substring(start, end);
    const newVal = freeTextInput.substring(0, start) + prefix + selected + suffix + freeTextInput.substring(end);
    setFreeTextInput(newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  }, [freeTextInput]);

  // ─── HANDLE MULTIPLE CHOICE ───
  const handleMCSelect = (optionIndex: number) => {
    const turn = turns[currentTurn];
    if (!turn.options) return;
    const option = turn.options[optionIndex];

    if (option.correct) {
      const resp: TurnResponse = { turnIndex: currentTurn, response: option.text, correct: true, feedback: turn.correct_feedback };
      setResponses(prev => [...prev, resp]);
      setCurrentFeedback({ correct: true, text: turn.correct_feedback });
      setPhase("showing-feedback");
    } else {
      // Incorrect
      if (retriesUsed < 2) {
        setCurrentFeedback({ correct: false, text: option.feedback });
        setPhase("retry-screen");
      } else {
        // Full restart
        setPhase("restart-screen");
      }
    }
  };

  // ─── HANDLE FREE TEXT ───
  const handleFreeTextSubmit = async () => {
    if (!freeTextInput.trim() || isSubmitting.current) return;
    isSubmitting.current = true;
    const turn = turns[currentTurn];
    setPhase("evaluating-free-text");

    try {
      const evalResult = await evaluateFreeText(
        turn.evaluation_criteria || "Demonstrates active listening, empathy, and avoids giving advice.",
        freeTextInput.trim()
      );

      if (evalResult.passed) {
        const resp: TurnResponse = {
          turnIndex: currentTurn,
          response: freeTextInput.trim(),
          correct: true,
          feedback: evalResult.feedback,
        };
        setResponses(prev => [...prev, resp]);
        setCurrentFeedback({ correct: true, text: evalResult.feedback });
        setFreeTextInput("");
        setPhase("showing-feedback");
      } else {
        if (retriesUsed < 2) {
          setCurrentFeedback({ correct: false, text: evalResult.feedback });
          setPhase("retry-screen");
        } else {
          setPhase("restart-screen");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
      const resp: TurnResponse = { turnIndex: currentTurn, response: freeTextInput.trim(), correct: true, feedback: "Response accepted." };
      setResponses(prev => [...prev, resp]);
      setFreeTextInput("");
      setCurrentFeedback({ correct: true, text: "Response accepted." });
      setPhase("showing-feedback");
    } finally {
      isSubmitting.current = false;
    }
  };

  // ─── ADVANCE TO NEXT TURN ───
  const advanceTurn = async () => {
    setCurrentFeedback(null);
    if (currentTurn + 1 >= turns.length) {
      // Final evaluation
      setPhase("final-evaluating");
      try {
        const convoText = responses.map(r => {
          const turn = turns[r.turnIndex];
          return `Alex: ${turn.seeker_message}\nListener: ${r.response}`;
        }).join("\n\n");

        const result = await finalEvaluation(convoText);
        setFinalResult(result);

        if (result.overall_passed) {
          setPhase("passed");
          onComplete({
            score: result.score,
            passed: true,
            feedback: result.feedback,
          });
        } else {
          setPhase("failed");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Final evaluation failed");
        setPhase("failed");
      }
    } else {
      setCurrentTurn(prev => prev + 1);
      setPhase("active");
    }
  };

  // ─── RETRY ───
  const handleRetry = () => {
    setRetriesUsed(prev => prev + 1);
    setCurrentFeedback(null);
    setFreeTextInput("");
    setPhase("active");
  };

  // ─── RESTART ───
  const handleRestart = () => {
    setRetriesUsed(0);
    loadSimulation();
  };

  const turn = turns[currentTurn];

  // ─── RENDER ───
  return (
    <div className={`flex flex-col ${isFocusMode ? "fixed inset-0 z-50 bg-background" : "h-full"}`}
      style={{ minHeight: isFocusMode ? undefined : "70vh" }}>

      {/* Top bar */}
      <div className="bg-foreground text-background px-3 py-1 flex items-center justify-between flex-shrink-0">
        <span className="font-display italic text-[16px]">● Echo — Formation: Simulation</span>
        <div className="flex items-center gap-2">
          {turns.length > 0 && phase !== "loading" && (
            <span className="font-body text-[11px]">
              Turn {Math.min(currentTurn + 1, turns.length)} / {turns.length}
            </span>
          )}
          <span className="font-body text-[11px]">
            ⚠ {2 - retriesUsed} {2 - retriesUsed === 1 ? "retry" : "retries"} remaining
          </span>
          <button
            onClick={() => setIsFocusMode(f => !f)}
            className="text-background echo-fade p-0.5"
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ─── LOADING ─── */}
      {phase === "loading" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="font-body text-[14px] echo-pulse">●</span>
            <p className="font-body text-[12px] text-muted-foreground mt-1">Generating simulation...</p>
          </div>
        </div>
      )}

      {/* ─── RETRY SCREEN ─── */}
      {phase === "retry-screen" && (
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="max-w-[480px] text-center">
            <h2 className="font-display text-[36px] text-foreground">Not quite.</h2>
            <p className="font-body text-[13px] text-foreground mt-2">{currentFeedback?.text}</p>
            <p className="font-body text-[12px] text-muted-foreground mt-2">
              You have {2 - retriesUsed - 1} {2 - retriesUsed - 1 === 1 ? "retry" : "retries"} remaining.
              {retriesUsed >= 1 && " This is your last retry."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
            >
              Try this turn again
            </button>
          </div>
        </div>
      )}

      {/* ─── RESTART SCREEN ─── */}
      {phase === "restart-screen" && (
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="max-w-[480px] text-center">
            <h2 className="font-display text-[36px] text-foreground">Starting over.</h2>
            <p className="font-body text-[13px] text-foreground mt-2">
              The simulation generates a new scenario each time. This means more practice, never repetition.
            </p>
            <button
              onClick={handleRestart}
              className="mt-3 border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
            >
              Begin New Simulation →
            </button>
          </div>
        </div>
      )}

      {/* ─── FINAL EVALUATING ─── */}
      {phase === "final-evaluating" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="font-body text-[14px] echo-pulse">●</span>
            <p className="font-body text-[12px] text-muted-foreground mt-1">Evaluating your performance...</p>
          </div>
        </div>
      )}

      {/* ─── EVALUATING FREE TEXT ─── */}
      {phase === "evaluating-free-text" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="font-body text-[14px] echo-pulse">●</span>
            <p className="font-body text-[12px] text-muted-foreground mt-1">Evaluating response...</p>
          </div>
        </div>
      )}

      {/* ─── PASSED ─── */}
      {phase === "passed" && finalResult && (
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="max-w-[480px] text-center">
            <h1 className="font-display text-[48px] text-foreground">You passed.</h1>
            <p className="font-body text-[14px] text-muted-foreground mt-2">
              Simulation Score: {finalResult.score}/100
            </p>
            <div className="mt-3 flex flex-col gap-1 text-left">
              {Object.entries(finalResult.feedback).map(([key, value]) => (
                <div key={key} className="border border-foreground p-2">
                  <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="font-body text-[12px] text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── FAILED ─── */}
      {phase === "failed" && (
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="max-w-[480px] text-center">
            <h1 className="font-display text-[48px] text-foreground">Not yet.</h1>
            {finalResult && (
              <>
                <p className="font-body text-[14px] text-muted-foreground mt-2">
                  Score: {finalResult.score}/100 (need 60 to pass)
                </p>
                <div className="mt-3 flex flex-col gap-1 text-left">
                  {Object.entries(finalResult.feedback).map(([key, value]) => (
                    <div key={key} className="border border-foreground p-2">
                      <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-body text-[12px] text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {error && <p className="font-body text-[11px] text-foreground mt-2">⚠ {error}</p>}
            <button
              onClick={handleRestart}
              className="mt-3 border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
            >
              Retry Simulation →
            </button>
          </div>
        </div>
      )}

      {/* ─── ACTIVE / SHOWING FEEDBACK ─── */}
      {(phase === "active" || phase === "showing-feedback") && turn && (
        <>
          {/* Message area */}
          <div
            ref={messagesRef}
            className={`flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-2 ${
              isFocusMode ? "" : "max-h-[calc(100vh-320px)]"
            }`}
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Previous turns (exclude the most recent if we're showing its feedback separately) */}
            {responses.map((resp, i) => {
              const t = turns[resp.turnIndex];
              const isLatest = i === responses.length - 1 && phase === "showing-feedback";
              return (
                <div key={i} className="flex flex-col gap-1">
                  {/* Alex message */}
                  <div className="flex items-start gap-1">
                    <div className="w-3 h-3 border border-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-body text-[9px] text-foreground">A</span>
                    </div>
                    <div className="border border-foreground p-1 max-w-[75%]">
                      <p className="font-body text-[13px] text-foreground">{t.seeker_message}</p>
                    </div>
                  </div>
                  {/* Listener response */}
                  <div className="flex justify-end">
                    <div className="bg-foreground text-background p-1 max-w-[75%]">
                      <p className="font-body text-[13px]">{renderFormatted(resp.response)}</p>
                    </div>
                  </div>
                  {/* Feedback — skip for latest turn since it's shown below via currentFeedback */}
                  {!isLatest && (
                    <div className={`p-1 font-body text-[11px] ${resp.correct ? "border border-foreground text-foreground" : "bg-foreground text-background"}`}>
                      {resp.correct ? "●" : "✕"} {resp.feedback}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current turn - Alex's message */}
            {phase === "active" && (
              <div className="flex items-start gap-1">
                <div className="w-3 h-3 border border-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-body text-[9px] text-foreground">A</span>
                </div>
                <div className="border border-foreground p-1 max-w-[75%]">
                  <p className="font-body text-[13px] text-foreground">{turn.seeker_message}</p>
                </div>
              </div>
            )}

            {/* Current feedback after correct response */}
            {phase === "showing-feedback" && currentFeedback && (
              <div className="p-1 border border-foreground font-body text-[11px] text-foreground">
                ● {currentFeedback.text}
              </div>
            )}

            {error && phase === "active" && (
              <p className="font-body text-[11px] text-foreground">⚠ {error}</p>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-foreground flex-shrink-0">
            {phase === "showing-feedback" ? (
              <div className="px-3 py-2">
                <button
                  onClick={advanceTurn}
                  className="w-full border border-foreground bg-foreground text-background py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
                >
                  {currentTurn + 1 >= turns.length ? "Complete Simulation →" : "Next Turn →"}
                </button>
              </div>
            ) : phase === "active" && turn.response_type === "multiple_choice" && turn.options ? (
              <div className="px-3 py-2 flex flex-col gap-0.5">
                {turn.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMCSelect(i)}
                    className="w-full border border-foreground bg-background text-foreground p-1 font-body text-[13px] text-left echo-fade hover:bg-foreground hover:text-background"
                  >
                    {String.fromCharCode(65 + i)}) {opt.text}
                  </button>
                ))}
              </div>
            ) : phase === "active" && turn.response_type === "free_text" ? (
              <div className="px-3 py-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <button onClick={() => insertFormat("**", "**")} className="p-0.5 text-muted-foreground echo-fade" title="Bold">
                    <Bold size={14} />
                  </button>
                  <button onClick={() => insertFormat("*", "*")} className="p-0.5 text-muted-foreground echo-fade" title="Italic">
                    <Italic size={14} />
                  </button>
                  <button onClick={() => insertFormat("__", "__")} className="p-0.5 text-muted-foreground echo-fade" title="Underline">
                    <Underline size={14} />
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={freeTextInput}
                  onChange={e => setFreeTextInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFreeTextSubmit(); }
                  }}
                  placeholder="Type your response as a Listener..."
                  rows={5}
                  className="w-full border border-foreground bg-background px-1 py-1 font-body text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none"
                  style={{ maxHeight: "240px" }}
                />
                <div className="flex justify-end mt-0.5">
                  <button
                    onClick={handleFreeTextSubmit}
                    disabled={!freeTextInput.trim()}
                    className={`border border-foreground bg-background text-foreground px-2 py-0.5 font-body text-[12px] uppercase tracking-widest echo-fade ${
                      !freeTextInput.trim() ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                  >
                    Send Response
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export { Simulation };
