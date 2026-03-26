import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormationStepData, QuizQuestion } from "./formationContent";

interface Props {
  step: FormationStepData;
  onComplete: (pointsEarned: number, answers: Record<string, { attempts: number; points: number }>) => void;
  completed: boolean;
  savedAnswers?: Record<string, { attempts: number; points: number }>;
}

type QuestionState = {
  selected: number | null;
  attempts: number;
  points: number;
  status: "unanswered" | "correct" | "retry" | "failed";
};

const StepContent = ({ step, onComplete, completed, savedAnswers }: Props) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"reading" | "quiz">(completed ? "quiz" : "reading");
  const [currentQ, setCurrentQ] = useState(0);
  const [qStates, setQStates] = useState<QuestionState[]>(
    step.quiz.map((q) => {
      const saved = savedAnswers?.[q.id];
      if (saved) return { selected: null, attempts: saved.attempts, points: saved.points, status: saved.attempts > 0 ? "correct" : "unanswered" };
      return { selected: null, attempts: 0, points: 0, status: "unanswered" };
    })
  );
  const [stepDone, setStepDone] = useState(completed);

  const totalStepPoints = qStates.reduce((s, q) => s + q.points, 0);

  const handleAnswer = (questionIndex: number) => {
    const q = step.quiz[questionIndex];
    const state = qStates[questionIndex];
    if (state.selected === null) return;

    const newStates = [...qStates];
    const isCorrect = state.selected === q.correctIndex;
    const newAttempts = state.attempts + 1;

    if (isCorrect) {
      const pts = q.points === 0 ? 0 : (newAttempts === 1 ? 2 : 1);
      newStates[questionIndex] = { ...state, attempts: newAttempts, points: pts, status: "correct" };
    } else if (newAttempts >= 2) {
      newStates[questionIndex] = { ...state, attempts: newAttempts, points: 0, status: "failed" };
    } else {
      newStates[questionIndex] = { ...state, attempts: newAttempts, selected: null, status: "retry" };
    }
    setQStates(newStates);
  };

  const advanceQuestion = () => {
    if (currentQ < step.quiz.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All done
      setStepDone(true);
      const answers: Record<string, { attempts: number; points: number }> = {};
      qStates.forEach((s, i) => { answers[step.quiz[i].id] = { attempts: s.attempts, points: s.points }; });
      const totalPts = qStates.reduce((sum, s) => sum + s.points, 0);
      onComplete(totalPts, answers);
    }
  };

  // ─── READING PHASE ───
  if (phase === "reading") {
    return (
      <div>
        {step.content.map((block, i) => {
          switch (block.type) {
            case "heading":
              return <h2 key={i} className="font-display text-[32px] leading-tight text-foreground mt-3 first:mt-0">{block.text}</h2>;
            case "subheading":
              return <h3 key={i} className="font-display text-[22px] leading-tight text-foreground mt-2">{block.text}</h3>;
            case "paragraph":
              return <p key={i} className="font-body text-[13px] text-foreground leading-relaxed mt-1">{block.text}</p>;
            case "list":
              return (
                <ul key={i} className="mt-1 flex flex-col gap-0.5">
                  {block.items?.map((item, j) => (
                    <li key={j} className="font-body text-[13px] text-foreground pl-2">— {item}</li>
                  ))}
                </ul>
              );
            case "chat":
              return (
                <div key={i} className="mt-2 border border-foreground p-2 flex flex-col gap-1">
                  {block.messages?.map((msg, j) => (
                    <div key={j} className={`flex flex-col ${msg.role === "listener" ? "items-end" : "items-start"}`}>
                      <span className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">
                        {msg.role === "seeker" ? "Seeker" : "Listener"}
                      </span>
                      <p className={`font-body text-[13px] text-foreground max-w-[80%] ${msg.role === "listener" ? "text-right" : "border-l border-foreground pl-1"}`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>
              );
            case "youtube":
              return (
                <div key={i} className="mt-2">
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 border border-foreground p-2 echo-fade no-underline"
                  >
                    <span className="font-body text-[20px]">▶</span>
                    <span className="font-body text-[12px] text-foreground">{block.caption}</span>
                  </a>
                </div>
              );
            case "divider":
              return <div key={i} className="border-t border-foreground my-2" />;
            default:
              return null;
          }
        })}
        <div className="mt-4">
          <button
            onClick={() => setPhase("quiz")}
            className="border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
          >
            Take Quiz →
          </button>
        </div>
      </div>
    );
  }

  // ─── QUIZ PHASE ───
  if (stepDone) {
    return (
      <div>
        <h2 className="font-display text-[32px] leading-tight text-foreground">{step.title}</h2>
        <p className="font-body text-[13px] text-foreground mt-2">
          ● Step complete — {totalStepPoints} points earned.
        </p>
        <div className="mt-2 flex flex-col gap-0.5">
          {step.quiz.map((q, i) => (
            <div key={i} className="font-body text-[11px] text-muted-foreground">
              {q.id}: {qStates[i].status === "correct" ? `✓ ${qStates[i].points} pts` : qStates[i].status === "failed" ? "✗ 0 pts" : `${qStates[i].points} pts`}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = step.quiz[currentQ];
  const state = qStates[currentQ];
  const isAnswered = state.status === "correct" || state.status === "failed";

  return (
    <div>
      <h2 className="font-display text-[32px] leading-tight text-foreground">{step.title}</h2>
      <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
        Question {currentQ + 1} of {step.quiz.length}
        {q.points === 0 && " — Introductory (no points)"}
      </p>

      <div className="mt-3 border border-foreground p-2">
        <p className="font-body text-[13px] text-foreground font-medium">{q.question}</p>

        <div className="mt-2 flex flex-col gap-0.5">
          {q.options.map((opt, oi) => {
            let cls = "border border-foreground p-1 font-body text-[12px] text-left echo-fade ";
            if (isAnswered) {
              if (oi === q.correctIndex) cls += "bg-foreground text-background";
              else if (state.selected === oi) cls += "bg-background text-muted-foreground line-through";
              else cls += "bg-background text-foreground";
            } else {
              cls += state.selected === oi ? "bg-foreground text-background" : "bg-background text-foreground";
            }
            return (
              <button
                key={oi}
                className={cls}
                disabled={isAnswered}
                onClick={() => {
                  if (isAnswered) return;
                  const ns = [...qStates];
                  ns[currentQ] = { ...state, selected: oi };
                  setQStates(ns);
                }}
              >
                {String.fromCharCode(65 + oi)}) {opt}
              </button>
            );
          })}
        </div>

        {/* Status messages */}
        {state.status === "retry" && (
          <p className="font-body text-[11px] text-foreground mt-1">✗ Incorrect. You have 1 more attempt.</p>
        )}
        {state.status === "correct" && (
          <p className="font-body text-[11px] text-foreground mt-1">
            ✓ Correct!{q.points > 0 && ` +${state.points} pts`}
          </p>
        )}
        {state.status === "failed" && (
          <div className="mt-1">
            <p className="font-body text-[11px] text-foreground">✗ Incorrect. The correct answer was: {String.fromCharCode(65 + q.correctIndex)}</p>
            <p className="font-body text-[11px] text-muted-foreground mt-0.5">{q.feedback}</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-1">
        {!isAnswered ? (
          <button
            onClick={() => handleAnswer(currentQ)}
            disabled={state.selected === null}
            className={`border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade ${state.selected === null ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={advanceQuestion}
            className="border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
          >
            {currentQ < step.quiz.length - 1 ? "Next Question →" : "Complete Step →"}
          </button>
        )}
      </div>
    </div>
  );
};

export { StepContent };
