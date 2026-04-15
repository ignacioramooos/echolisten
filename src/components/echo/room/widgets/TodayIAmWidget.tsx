import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const TodayIAmWidget = ({ widgetId, config }: Props) => {
  const [lines, setLines] = useState<[string, string, string]>([
    (config?.line1 as string) || "",
    (config?.line2 as string) || "",
    (config?.line3 as string) || "",
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      supabase
        .from("dashboard_widgets")
        .update({ config: { ...config, line1: lines[0], line2: lines[1], line3: lines[2] } })
        .eq("id", widgetId)
        .then();
    }, 800);
    return () => clearTimeout(timeout);
  }, [lines]);

  const update = (i: number, val: string) => {
    const next = [...lines] as [string, string, string];
    next[i] = val;
    setLines(next);
  };

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-3">Today I Am</p>
      <div className="flex flex-col gap-2 flex-1 justify-center">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            value={lines[i]}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Line ${i + 1}`}
            className="font-body text-[12px] text-foreground bg-transparent border-b border-muted pb-1 focus:outline-none placeholder:text-muted-foreground"
          />
        ))}
      </div>
    </div>
  );
};

export default TodayIAmWidget;
