import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const MemoryShelfWidget = ({ widgetId, config }: Props) => {
  const [items, setItems] = useState<string[]>((config?.items as string[]) || []);
  const [input, setInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      supabase
        .from("dashboard_widgets")
        .update({ config: { ...config, items } })
        .eq("id", widgetId)
        .then();
    }, 600);
    return () => clearTimeout(timeout);
  }, [items]);

  const add = () => {
    if (!input.trim()) return;
    setItems([...items, input.trim()]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-2">Memory Shelf</p>
      <div className="flex-1 overflow-y-auto space-y-1">
        {items.map((item, i) => (
          <p key={i} className="font-body text-[11px] text-foreground">
            · {item}
          </p>
        ))}
        {items.length === 0 && (
          <p className="font-body text-[11px] text-muted-foreground italic">Nothing yet.</p>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a memory…"
          className="flex-1 font-body text-[11px] text-foreground bg-transparent border-b border-muted focus:outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="font-body text-[10px] text-foreground border border-foreground px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors duration-150 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default MemoryShelfWidget;
