import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const moods = ["😌", "😊", "😐", "😔", "😢", "😤", "🥰", "😴"];

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const MoodReflectionWidget = ({ widgetId, config }: Props) => {
  const [selected, setSelected] = useState<string | null>((config?.mood as string) || null);

  const pick = async (mood: string) => {
    setSelected(mood);
    await supabase
      .from("dashboard_widgets")
      .update({ config: { ...config, mood } })
      .eq("id", widgetId);
  };

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-2">Mood Reflection</p>
      <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => pick(m)}
            className={`text-[20px] p-1 transition-opacity duration-150 ${
              selected && selected !== m ? "opacity-30" : "opacity-100"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodReflectionWidget;
