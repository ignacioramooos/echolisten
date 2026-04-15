import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const StickyNoteWidget = ({ widgetId, config }: Props) => {
  const [text, setText] = useState((config?.text as string) || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      supabase
        .from("dashboard_widgets")
        .update({ config: { ...config, text } })
        .eq("id", widgetId)
        .then();
    }, 800);
    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-2">Sticky Note</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write anything here…"
        className="flex-1 resize-none bg-transparent font-body text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
};

export default StickyNoteWidget;
