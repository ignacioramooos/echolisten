import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const CounterWidget = ({ widgetId, config }: Props) => {
  const [label, setLabel] = useState((config?.label as string) || "Days");
  const [count, setCount] = useState((config?.count as number) || 0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      supabase
        .from("dashboard_widgets")
        .update({ config: { ...config, label, count } })
        .eq("id", widgetId)
        .then();
    }, 600);
    return () => clearTimeout(timeout);
  }, [label, count]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-1">Counter</p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="font-body text-[11px] text-foreground bg-transparent text-center border-b border-muted focus:outline-none mb-2 w-full max-w-[120px]"
      />
      <p className="font-display text-[36px] text-foreground leading-none">{count}</p>
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => setCount(Math.max(0, count - 1))}
          className="font-body text-[14px] text-foreground border border-foreground w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors duration-150"
        >
          −
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="font-body text-[14px] text-foreground border border-foreground w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors duration-150"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CounterWidget;
