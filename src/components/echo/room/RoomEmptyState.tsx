interface RoomEmptyStateProps {
  onSelectPreset: (preset: "calm" | "focused" | "expressive" | "steady") => void;
}

const presets = [
  {
    id: "calm" as const,
    label: "Calm",
    desc: "Mood reflection, emotional weather, and a sticky note.",
  },
  {
    id: "focused" as const,
    label: "Focused",
    desc: "Counter, quick journal, and one thing that helped.",
  },
  {
    id: "expressive" as const,
    label: "Expressive",
    desc: "Today I Am, mood reflection, memory shelf, and quick journal.",
  },
  {
    id: "steady" as const,
    label: "Steady",
    desc: "Breathe, mood reflection, and emotional weather.",
  },
];

const RoomEmptyState = ({ onSelectPreset }: RoomEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <p className="font-display italic text-[28px] text-foreground text-center">
        This is your room.
      </p>
      <p className="font-display italic text-[28px] text-foreground text-center mt-1">
        Add what you need.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-[640px]">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className="flex-1 border border-foreground p-5 text-left hover:bg-foreground hover:text-background transition-colors duration-150 group"
          >
            <p className="font-body text-[13px] text-foreground group-hover:text-background">
              {p.label}
            </p>
            <p className="font-body text-[11px] text-muted-foreground group-hover:text-background/70 mt-2">
              {p.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export { RoomEmptyState };
