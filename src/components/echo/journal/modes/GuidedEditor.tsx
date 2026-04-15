import { useState } from "react";

const PROMPTS = [
  "What happened?",
  "How did it make you feel?",
  "What do you wish were different?",
];

interface GuidedEditorProps {
  value: string;
  onChange: (v: string) => void;
}

const GuidedEditor = ({ value, onChange }: GuidedEditorProps) => {
  // Parse stored value: answers separated by \n---\n
  const parseAnswers = (v: string): string[] => {
    const parts = v.split("\n---\n");
    return [parts[0] || "", parts[1] || "", parts[2] || ""];
  };

  const [answers, setAnswers] = useState<string[]>(parseAnswers(value));
  const [step, setStep] = useState(0);

  const update = (idx: number, text: string) => {
    const next = [...answers];
    next[idx] = text;
    setAnswers(next);
    onChange(next.join("\n---\n"));
  };

  return (
    <div className="flex flex-col gap-6 min-h-[200px]">
      {PROMPTS.map((prompt, i) => (
        i <= step && (
          <div key={i} className="animate-in fade-in duration-150">
            <p className="font-display italic text-[16px] text-foreground mb-3">
              {prompt}
            </p>
            <textarea
              value={answers[i]}
              onChange={(e) => update(i, e.target.value)}
              className="w-full resize-none bg-transparent font-body text-[13px] text-foreground focus:outline-none border-b border-muted pb-2 min-h-[80px]"
            />
          </div>
        )
      ))}
      {step < 2 && (
        <button
          onClick={() => setStep((s) => s + 1)}
          disabled={!answers[step]?.trim()}
          className="self-start font-body text-[11px] border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 disabled:opacity-30"
        >
          Next
        </button>
      )}
    </div>
  );
};

export { GuidedEditor };
