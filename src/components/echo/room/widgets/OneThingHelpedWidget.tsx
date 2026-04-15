import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const OneThingHelpedWidget = ({ widgetId, config }: Props) => {
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
      <p className="font-body text-[10px] text-muted-foreground mb-2">One Thing That Helped</p>
      <div className="flex-1 flex items-center justify-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What helped today?"
          className="font-body text-[13px] text-foreground bg-transparent text-center border-b border-muted focus:outline-none placeholder:text-muted-foreground w-full max-w-[200px]"
        />
      </div>
    </div>
  );
};

export default OneThingHelpedWidget;
