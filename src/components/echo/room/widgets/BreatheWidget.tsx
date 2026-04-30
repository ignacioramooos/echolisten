import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BreatheCircle from "@/components/echo/breathe/BreatheCircle";
import { DURATION_OPTIONS, PATTERNS, type BreathePatternId, usePattern } from "@/components/echo/breathe/usePattern";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const isPattern = (value: unknown): value is BreathePatternId =>
  value === "calm" || value === "box" || value === "slow";

const BreatheWidget = ({ widgetId, config }: Props) => {
  const [pattern, setPattern] = useState<BreathePatternId>(isPattern(config?.pattern) ? config.pattern : "calm");
  const [duration, setDuration] = useState<number>(
    typeof config?.durationSeconds === "number" ? config.durationSeconds : 60
  );

  const saveConfig = useCallback(
    async (nextPattern: BreathePatternId, nextDuration: number) => {
      await supabase
        .from("dashboard_widgets")
        .update({ config: { ...config, pattern: nextPattern, durationSeconds: nextDuration } })
        .eq("id", widgetId);
    },
    [config, widgetId]
  );

  const session = usePattern({
    pattern,
    durationSeconds: duration,
    tick: false,
  });

  const changePattern = async (next: BreathePatternId) => {
    setPattern(next);
    await saveConfig(next, duration);
  };

  const changeDuration = async (next: number) => {
    setDuration(next);
    await saveConfig(pattern, next);
  };

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-body text-[10px] text-muted-foreground">Breathe</p>
          <p className="font-body text-[12px] text-foreground mt-1">A minute to breathe.</p>
        </div>
        <Link to="/dashboard/breathe" className="font-body text-[10px] text-muted-foreground underline echo-fade">
          Open full screen
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <BreatheCircle
          phase={session.currentPhase}
          phaseRemaining={session.phaseRemaining}
          running={session.running}
          size="compact"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(Object.keys(PATTERNS) as BreathePatternId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => changePattern(id)}
              className={`font-body text-[9px] border px-1 py-0.5 echo-fade ${
                pattern === id ? "border-foreground bg-foreground text-background" : "border-muted text-muted-foreground"
              }`}
            >
              {PATTERNS[id].label}
            </button>
          ))}
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.seconds}
              type="button"
              onClick={() => changeDuration(option.seconds)}
              className={`font-body text-[9px] border px-1 py-0.5 echo-fade ${
                duration === option.seconds ? "border-foreground bg-foreground text-background" : "border-muted text-muted-foreground"
              }`}
            >
              {option.seconds / 60}m
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={session.running ? session.reset : session.start}
          className="font-body text-[10px] text-foreground underline echo-fade"
        >
          {session.running ? "End" : "Start"}
        </button>
      </div>
    </div>
  );
};

export default BreatheWidget;

