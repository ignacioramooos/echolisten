import { type JournalMode } from "./journalData";

interface JournalSidebarProps {
  entries: {
    id: string;
    mode: string;
    content: string | null;
    created_at: string;
  }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const modeLabels: Record<string, string> = {
  free: "Free",
  guided: "Guided",
  bullet: "Bullet",
  unspeakable: "Unspeakable",
  one_sentence: "One Sentence",
  prompted: "Prompted",
};

const JournalSidebar = ({ entries, activeId, onSelect, collapsed, onToggle }: JournalSidebarProps) => {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-[65px] z-40 bg-background border-r border-muted px-2 py-3 font-body text-[11px] text-muted-foreground writing-mode-vertical hover:text-foreground transition-colors duration-150"
        style={{ writingMode: "vertical-rl" }}
      >
        Journal entries ›
      </button>
    );
  }

  return (
    <aside className="w-[260px] shrink-0 border-r border-muted h-full overflow-y-auto bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-muted">
        <p className="font-body text-[11px] text-muted-foreground">Past entries</p>
        <button
          onClick={onToggle}
          className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ‹ Hide
        </button>
      </div>
      {entries.length === 0 && (
        <p className="px-4 py-6 font-body text-[11px] text-muted-foreground italic">
          No entries yet.
        </p>
      )}
      {entries.map((entry) => {
        const date = new Date(entry.created_at);
        const dateStr = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        const preview = (entry.content || "").slice(0, 40).trim();
        return (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            className={`w-full text-left px-4 py-3 border-b border-muted transition-colors duration-150 ${
              activeId === entry.id ? "bg-muted" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="font-body text-[10px] text-muted-foreground">{dateStr}</p>
              <p className="font-body text-[10px] text-muted-foreground">·</p>
              <p className="font-body text-[10px] text-muted-foreground">
                {modeLabels[entry.mode] || entry.mode}
              </p>
            </div>
            {preview && (
              <p className="font-body text-[11px] text-foreground mt-1 truncate">
                {preview}{preview.length >= 40 ? "…" : ""}
              </p>
            )}
          </button>
        );
      })}
    </aside>
  );
};

export { JournalSidebar };
