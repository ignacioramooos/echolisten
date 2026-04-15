import { getTodaysPrompt } from "../journalData";

interface PromptedEditorProps {
  value: string;
  onChange: (v: string) => void;
}

const PromptedEditor = ({ value, onChange }: PromptedEditorProps) => {
  const prompt = getTodaysPrompt();

  return (
    <div className="flex flex-col gap-4 min-h-[200px]">
      <p className="font-display italic text-[16px] text-foreground">
        {prompt}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full flex-1 resize-none bg-transparent font-body text-[13px] text-foreground focus:outline-none border-b border-muted pb-2 min-h-[140px]"
      />
    </div>
  );
};

export { PromptedEditor };
