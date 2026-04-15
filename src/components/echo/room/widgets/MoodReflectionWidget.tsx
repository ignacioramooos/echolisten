import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

/* ── Inline dropdown ── */
const InlineDropdown = ({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string | null;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`font-body text-[11px] border-b pb-0.5 focus:outline-none ${
          value ? "text-foreground border-foreground" : "text-muted-foreground border-muted"
        }`}
      >
        {value || placeholder}
        <span className="ml-1 text-[9px]">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-background border border-foreground min-w-[140px] max-h-[160px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 font-body text-[11px] hover:bg-muted transition-colors duration-100 ${
                value === opt ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Constants ── */
const FEELING_OPTIONS = ["calm", "happy", "anxious", "sad", "angry", "confused", "numb", "hopeful", "tired", "grateful", "overwhelmed", "okay"];
const WEATHER_OPTIONS = ["clear", "cloudy", "stormy", "heavy", "warming up", "foggy"];
const NEED_OPTIONS = ["silence", "comfort", "space", "connection", "rest", "distraction", "nothing"];

const PRIMARY_FEELINGS = ["anxious", "numb", "heavy", "angry", "relieved", "sad", "content", "lost", "okay", "other"];

const BRANCHING: Record<string, { prompt: string; options: string[] }> = {
  anxious: { prompt: "anxious about —", options: ["social", "the future", "something I can't name", "everything"] },
  sad: { prompt: "sad because —", options: ["someone", "something ending", "I don't know", "everything"] },
  angry: { prompt: "angry at —", options: ["myself", "someone", "the situation", "everything"] },
  lost: { prompt: "lost because —", options: ["no direction", "too many choices", "I don't know", "everything"] },
};

const NEED_NOW_OPTIONS = ["silence", "distraction", "sleep", "reassurance", "movement", "connection", "nothing"];

/* ── Widget ── */
const MoodReflectionWidget = ({ widgetId, config }: Props) => {
  // Section 1
  const [feeling, setFeeling] = useState<string | null>(null);
  const [carrying, setCarrying] = useState("");
  const [need, setNeed] = useState<string | null>(null);

  // Section 2
  const [weather, setWeather] = useState<string | null>(null);

  // Section 3
  const [deeperOpen, setDeeperOpen] = useState(false);
  const [primaryFeeling, setPrimaryFeeling] = useState<string | null>(null);
  const [branchAnswer, setBranchAnswer] = useState<string | null>(null);
  const [needNow, setNeedNow] = useState<string | null>(null);

  // Save state
  const [loggedAt, setLoggedAt] = useState<string | null>(null);

  const handleLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reason = [
      feeling && `feeling: ${feeling}`,
      carrying && `carrying: ${carrying}`,
      need && `need: ${need}`,
      primaryFeeling && `primary: ${primaryFeeling}`,
      branchAnswer && `detail: ${branchAnswer}`,
    ].filter(Boolean).join("; ");

    await supabase.from("mood_logs").insert({
      user_id: user.id,
      primary_feeling: primaryFeeling || feeling,
      reason: reason || null,
      need_now: needNow || need,
      emotional_weather: weather ? weather.replace(" ", "_") as any : null,
    } as any);

    const now = new Date();
    setLoggedAt(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

    setTimeout(() => {
      setLoggedAt(null);
      setFeeling(null);
      setCarrying("");
      setNeed(null);
      setWeather(null);
      setDeeperOpen(false);
      setPrimaryFeeling(null);
      setBranchAnswer(null);
      setNeedNow(null);
    }, 3000);
  };

  if (loggedAt) {
    return (
      <div className="h-full flex items-center justify-center p-2 animate-in fade-in duration-150">
        <p className="font-body text-[11px] text-muted-foreground">
          Logged at {loggedAt}.
        </p>
      </div>
    );
  }

  const branch = primaryFeeling ? BRANCHING[primaryFeeling] : null;

  return (
    <div className="h-full flex flex-col p-2 overflow-y-auto gap-4">
      {/* Section 1: Today I Am */}
      <div className="flex flex-col gap-2">
        <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Today I Am</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-body text-[11px] text-foreground whitespace-nowrap">feeling —</span>
          <InlineDropdown value={feeling} options={FEELING_OPTIONS} placeholder="select" onChange={setFeeling} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-body text-[11px] text-foreground whitespace-nowrap">carrying —</span>
          <input
            value={carrying}
            onChange={(e) => setCarrying(e.target.value)}
            placeholder="…"
            className="font-body text-[11px] text-foreground bg-transparent border-b border-muted focus:outline-none focus:border-foreground pb-0.5 min-w-[80px] flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-body text-[11px] text-foreground whitespace-nowrap">need —</span>
          <InlineDropdown value={need} options={NEED_OPTIONS} placeholder="select" onChange={setNeed} />
        </div>
      </div>

      {/* Section 2: Emotional Weather */}
      <div className="flex flex-col gap-1.5">
        <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Emotional Weather</p>
        <p className="font-body text-[10px] text-muted-foreground">Right now, it feels like —</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w}
              onClick={() => setWeather(weather === w ? null : w)}
              className={`font-body text-[11px] transition-all duration-100 ${
                weather === w
                  ? "text-foreground font-medium border-b border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Drill */}
      {!deeperOpen ? (
        <button
          onClick={() => setDeeperOpen(true)}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start"
        >
          go deeper →
        </button>
      ) : (
        <div className="flex flex-col gap-2 animate-in fade-in duration-150">
          <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Mood Drill</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-body text-[10px] text-foreground">primary —</span>
            <InlineDropdown value={primaryFeeling} options={PRIMARY_FEELINGS} placeholder="select" onChange={(v) => { setPrimaryFeeling(v); setBranchAnswer(null); }} />
          </div>

          {branch && (
            <div className="flex items-center gap-1.5 flex-wrap animate-in fade-in duration-150">
              <span className="font-body text-[10px] text-foreground">{branch.prompt}</span>
              <InlineDropdown value={branchAnswer} options={branch.options} placeholder="select" onChange={setBranchAnswer} />
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-body text-[10px] text-foreground">what I need —</span>
            <InlineDropdown value={needNow} options={NEED_NOW_OPTIONS} placeholder="select" onChange={setNeedNow} />
          </div>
        </div>
      )}

      {/* Log */}
      <button
        onClick={handleLog}
        className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start mt-auto"
      >
        log this
      </button>
    </div>
  );
};

export default MoodReflectionWidget;
