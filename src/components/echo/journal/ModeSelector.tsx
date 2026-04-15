import { JOURNAL_MODES, type JournalMode } from "./journalData";

interface ModeSelectorProps {
  active: JournalMode;
  onChange: (mode: JournalMode) => void;
}

const ModeSelector = ({ active, onChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-0 overflow-x-auto border-b border-muted scrollbar-hide">
      {JOURNAL_MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`font-body text-[12px] px-4 py-2.5 whitespace-nowrap transition-opacity duration-150 border-b-[1.5px] -mb-px ${
            active === m.id
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};

export { ModeSelector };
