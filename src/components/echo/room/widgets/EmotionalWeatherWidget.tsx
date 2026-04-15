import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const weathers = [
  { id: "clear", label: "Clear", icon: "☀️" },
  { id: "cloudy", label: "Cloudy", icon: "☁️" },
  { id: "stormy", label: "Stormy", icon: "⛈️" },
  { id: "heavy", label: "Heavy", icon: "🌧️" },
  { id: "warming_up", label: "Warming up", icon: "🌤️" },
  { id: "foggy", label: "Foggy", icon: "🌫️" },
] as const;

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const EmotionalWeatherWidget = ({ widgetId, config }: Props) => {
  const [selected, setSelected] = useState<string | null>((config?.weather as string) || null);

  const pick = async (weather: string) => {
    setSelected(weather);
    await supabase
      .from("dashboard_widgets")
      .update({ config: { ...config, weather } })
      .eq("id", widgetId);
  };

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-2">Emotional Weather</p>
      <div className="flex flex-wrap gap-2 items-center justify-center flex-1">
        {weathers.map((w) => (
          <button
            key={w.id}
            onClick={() => pick(w.id)}
            className={`flex flex-col items-center gap-0.5 p-1.5 transition-opacity duration-150 ${
              selected && selected !== w.id ? "opacity-30" : "opacity-100"
            }`}
          >
            <span className="text-[18px]">{w.icon}</span>
            <span className="font-body text-[9px] text-muted-foreground">{w.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmotionalWeatherWidget;
