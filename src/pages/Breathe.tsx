import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BreatheCircle from "@/components/echo/breathe/BreatheCircle";
import { DURATION_OPTIONS, PATTERNS, type BreathePatternId, usePattern } from "@/components/echo/breathe/usePattern";

const WEATHER = [
  { id: "clear", label: "clear" },
  { id: "cloudy", label: "cloudy" },
  { id: "stormy", label: "stormy" },
  { id: "heavy", label: "heavy" },
  { id: "warming_up", label: "warming up" },
  { id: "foggy", label: "foggy" },
] as const;

const Breathe = () => {
  const navigate = useNavigate();
  const db = supabase as any;
  const [pattern, setPattern] = useState<BreathePatternId>("calm");
  const [duration, setDuration] = useState(60);
  const [tick, setTick] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [moodAfter, setMoodAfter] = useState<string | null>(null);
  const recordingRef = useRef(false);

  const writeSession = useCallback(
    async (completed: boolean) => {
      if (recordingRef.current) return;
      recordingRef.current = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await db
        .from("breathing_sessions")
        .insert({
          user_id: user.id,
          pattern,
          duration_seconds: duration,
          completed,
        })
        .select("id")
        .single();

      if (data) setRecordId(data.id);
    },
    [duration, pattern]
  );

  const session = usePattern({
    pattern,
    durationSeconds: duration,
    tick,
    onComplete: () => {
      writeSession(true);
    },
  });

  const start = () => {
    recordingRef.current = false;
    setRecordId(null);
    setMoodAfter(null);
    session.start();
  };

  const end = async () => {
    if (session.running) {
      await writeSession(false);
    }
    navigate(-1);
  };

  const again = () => {
    recordingRef.current = false;
    setRecordId(null);
    setMoodAfter(null);
    session.reset();
  };

  const chooseMood = async (weather: string) => {
    setMoodAfter(weather);
    if (!recordId) return;
    await db
      .from("breathing_sessions")
      .update({ mood_after: weather })
      .eq("id", recordId);
  };

  const minutes = duration / 60;
  const doneLine = `That's ${minutes === 1 ? "a minute" : `${minutes} minutes`} back to yourself.`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3">
        <p className="font-body text-[12px] text-muted-foreground">Breathe</p>
        <button type="button" onClick={end} className="font-body text-[12px] text-foreground underline echo-fade">
          End
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {!session.done ? (
          <>
            <p className="font-body text-[13px] text-muted-foreground mb-8">Follow the circle. In. Hold. Out.</p>
            <BreatheCircle
              phase={session.currentPhase}
              phaseRemaining={session.phaseRemaining}
              running={session.running}
            />
            <p className="font-body text-[12px] text-muted-foreground mt-8">{session.progressLabel}</p>
          </>
        ) : (
          <div className="text-center max-w-[520px]">
            <p className="font-body text-[18px] text-foreground">{doneLine}</p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button type="button" onClick={again} className="font-body text-[12px] underline echo-fade">
                Again
              </button>
              <button type="button" onClick={() => navigate(-1)} className="font-body text-[12px] underline echo-fade">
                Done
              </button>
            </div>

            <div className="mt-10">
              <p className="font-body text-[11px] text-muted-foreground">How do you feel now?</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {WEATHER.map((weather) => (
                  <button
                    key={weather.id}
                    type="button"
                    onClick={() => chooseMood(weather.id)}
                    className={`font-body text-[11px] border px-2 py-1 echo-fade ${
                      moodAfter === weather.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground text-foreground"
                    }`}
                  >
                    {weather.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => navigate(-1)} className="font-body text-[11px] text-muted-foreground underline mt-4">
                Skip
              </button>
            </div>
          </div>
        )}
      </main>

      {!session.done && (
        <footer className="fixed left-0 right-0 bottom-0 z-40 px-4 py-4 opacity-100 sm:opacity-0 sm:hover:opacity-100 sm:focus-within:opacity-100 echo-fade">
          <div className="mx-auto max-w-[720px] border border-foreground bg-background p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PATTERNS) as BreathePatternId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPattern(id)}
                    disabled={session.running}
                    className={`font-body text-[11px] border px-2 py-1 echo-fade disabled:opacity-40 ${
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
                    onClick={() => setDuration(option.seconds)}
                    disabled={session.running}
                    className={`font-body text-[11px] border px-2 py-1 echo-fade disabled:opacity-40 ${
                      duration === option.seconds ? "border-foreground bg-foreground text-background" : "border-muted text-muted-foreground"
                    }`}
                  >
                    {option.seconds / 60} min
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="font-body text-[11px] text-muted-foreground flex items-center gap-2">
                  <input type="checkbox" checked={tick} onChange={(event) => setTick(event.target.checked)} />
                  tick
                </label>
                <button type="button" onClick={session.running ? end : start} className="font-body text-[12px] underline echo-fade">
                  {session.running ? "End" : "Start"}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Breathe;
