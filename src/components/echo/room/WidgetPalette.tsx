import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const WIDGET_TYPES = [
  { type: "sticky_note", label: "Sticky Note", desc: "A note, a song, a quote. Anything." },
  { type: "mood_reflection", label: "Mood Reflection", desc: "How you feel, without needing words." },
  { type: "counter", label: "Counter", desc: "Track what matters to you." },
  { type: "journal_quick", label: "Quick Journal", desc: "Write something. Anything." },
  { type: "emotional_weather", label: "Emotional Weather", desc: "One metaphor for right now." },
  { type: "today_i_am", label: "Today I Am", desc: "Three lines for today." },
  { type: "memory_shelf", label: "Memory Shelf", desc: "Things you want to keep." },
  { type: "one_thing_helped", label: "One Thing That Helped", desc: "Small victories." },
  { type: "breathe", label: "Breathe", desc: "A quiet breathing cycle." },
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number]["type"];

interface WidgetPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: WidgetType) => void;
}

const WidgetPalette = ({ open, onOpenChange, onAdd }: WidgetPaletteProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] bg-background border-l border-foreground p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="font-display italic text-[20px] text-foreground">
            Add to your room
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-0">
          {WIDGET_TYPES.map((w) => (
            <div
              key={w.type}
              className="flex items-center justify-between px-6 py-4 border-t border-muted"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-body text-[13px] text-foreground">{w.label}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-0.5">{w.desc}</p>
              </div>
              <button
                onClick={() => onAdd(w.type)}
                className="font-body text-[11px] border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 shrink-0"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { WidgetPalette, WIDGET_TYPES };
