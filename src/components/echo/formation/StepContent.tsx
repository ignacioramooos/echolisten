import { useState } from "react";
import { FormationStep } from "./formationData";
import { EchoButton } from "@/components/echo/EchoButton";

interface StepContentProps {
  step: FormationStep;
  onComplete: () => void;
  completed: boolean;
}

const StepContent = ({ step, onComplete, completed }: StepContentProps) => {
  const [phase, setPhase] = useState<"reading" | "quiz">(completed ? "quiz" : "reading");
  const [answers, setAnswers] = useState<(number | null)[]>(step.quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(completed);

  const correctCount = answers.reduce(
    (acc, ans, i) => acc + (ans === step.quiz[i].correctIndex ? 1 : 0),
    0
  );

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const didPass = correctCount >= step.passThreshold;
    setPassed(didPass);
    if (didPass) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setAnswers(step.quiz.map(() => null));
    setSubmitted(false);
    setPassed(false);
  };

  if (phase === "reading") {
    return (
      <div>
        <h2 className="font-display text-[32px] leading-tight text-foreground">{step.title}</h2>
        <div className="mt-3 flex flex-col gap-2">
          {step.reading.map((paragraph, i) => (
            <p key={i} className="font-body text-[13px] text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-4">
          <EchoButton variant="outline" size="md" onClick={() => setPhase("quiz")}>
            Take Knowledge Check →
          </EchoButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-[32px] leading-tight text-foreground">{step.title}</h2>
      <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
        Knowledge Check — {step.passThreshold}/{step.quiz.length} required to pass
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {step.quiz.map((q, qi) => (
          <div key={qi} className="border border-foreground p-2">
            <p className="font-body text-[13px] text-foreground font-medium">{q.question}</p>
            <div className="mt-1 flex flex-col gap-0.5">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = oi === q.correctIndex;
                let optionClass = "border border-foreground p-1 font-body text-[12px] cursor-pointer echo-fade";

                if (submitted) {
                  if (isCorrect) {
                    optionClass += " bg-foreground text-background";
                  } else if (isSelected && !isCorrect) {
                    optionClass += " bg-background text-muted-foreground line-through";
                  } else {
                    optionClass += " bg-background text-foreground";
                  }
                } else {
                  optionClass += isSelected
                    ? " bg-foreground text-background"
                    : " bg-background text-foreground";
                }

                return (
                  <button
                    key={oi}
                    type="button"
                    className={optionClass}
                    onClick={() => {
                      if (submitted) return;
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {!submitted ? (
          <EchoButton
            variant="solid"
            size="md"
            onClick={handleSubmitQuiz}
            disabled={answers.some((a) => a === null)}
            className={answers.some((a) => a === null) ? "opacity-40 cursor-not-allowed" : ""}
          >
            Submit Answers
          </EchoButton>
        ) : passed ? (
          <p className="font-body text-[13px] text-foreground">
            ● Passed — {correctCount}/{step.quiz.length} correct.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="font-body text-[13px] text-foreground">
              Not yet — {correctCount}/{step.quiz.length} correct. You need {step.passThreshold}.
            </p>
            <EchoButton variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </EchoButton>
          </div>
        )}
      </div>
    </div>
  );
};

export { StepContent };
