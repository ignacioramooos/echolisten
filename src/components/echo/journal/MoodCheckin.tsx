import { MOOD_OPTIONS } from "./journalData";

interface MoodCheckinProps {
  label: string;
  value: string | null;
  onChange: (mood: string) => void;
}

const MoodCheckin = ({ label, value, onChange }: MoodCheckinProps) => (
  <div className="flex items-center gap-3">
    <p className="font-display italic text-[14px] text-foreground whitespace-nowrap">
      {label}
    </p>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="font-body text-[12px] text-foreground bg-transparent border-b border-muted focus:outline-none py-1 px-0 appearance-none cursor-pointer min-w-[120px]"
    >
      <option value="" disabled>
        —
      </option>
      {MOOD_OPTIONS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  </div>
);

export { MoodCheckin };
