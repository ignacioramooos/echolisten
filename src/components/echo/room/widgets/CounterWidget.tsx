import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

interface CounterRow {
  id: string;
  label: string;
  counter_type: "since" | "times";
  start_date: string;
  count: number;
  last_reset: string | null;
  reset_mode?: string; // "monthly" | "total" — stored in widget config
}

const MILESTONES = [7, 14, 30, 60, 90];

const daysSince = (dateStr: string): number => {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const formatShortDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/* ── Creation form ── */
const CreationForm = ({ onCreated }: { onCreated: () => void }) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"since" | "times" | null>(null);
  const [resetMode, setResetMode] = useState<"monthly" | "total">("total");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!label.trim() || !type) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("counters").insert({
      user_id: user.id,
      label: label.trim(),
      counter_type: type as any,
      start_date: new Date().toISOString(),
      count: 0,
    } as any);

    setSaving(false);
    onCreated();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">New counter</p>

      <div className="flex items-start gap-1.5">
        <span className="font-body text-[11px] text-foreground whitespace-nowrap mt-0.5">I want to track —</span>
        <input
          value={label}
          onChange={(e) => { if (e.target.value.length <= 60) setLabel(e.target.value); }}
          placeholder="…"
          className="font-body text-[11px] text-foreground bg-transparent border-b border-muted focus:outline-none focus:border-foreground pb-0.5 flex-1 placeholder:text-muted-foreground min-w-0"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setType("since")}
          className={`font-body text-[10px] transition-all duration-100 ${
            type === "since" ? "text-foreground font-medium border-b border-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          time elapsed since last time
        </button>
        <button
          onClick={() => setType("times")}
          className={`font-body text-[10px] transition-all duration-100 ${
            type === "times" ? "text-foreground font-medium border-b border-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          number of times it happened
        </button>
      </div>

      {type === "times" && (
        <div className="flex gap-3 animate-in fade-in duration-150">
          <button
            onClick={() => setResetMode("monthly")}
            className={`font-body text-[10px] transition-all duration-100 ${
              resetMode === "monthly" ? "text-foreground font-medium border-b border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            reset monthly
          </button>
          <button
            onClick={() => setResetMode("total")}
            className={`font-body text-[10px] transition-all duration-100 ${
              resetMode === "total" ? "text-foreground font-medium border-b border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            never reset (total)
          </button>
        </div>
      )}

      <button
        onClick={create}
        disabled={!label.trim() || !type || saving}
        className="self-start font-body text-[11px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-30 mt-1"
      >
        {saving ? "Creating…" : "Create"}
      </button>
    </div>
  );
};

/* ── Single counter card ── */
const CounterCard = ({
  counter,
  resetMode,
  onUpdate,
}: {
  counter: CounterRow;
  resetMode: string;
  onUpdate: () => void;
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [dismissedMilestone, setDismissedMilestone] = useState(false);

  const days = counter.counter_type === "since" ? daysSince(counter.start_date) : 0;
  const isMilestone = counter.counter_type === "since" && MILESTONES.includes(days) && !dismissedMilestone;

  // For "times" + monthly: check if we need conceptual reset display
  const displayCount = counter.count;

  const handleIncrement = async () => {
    await supabase
      .from("counters")
      .update({ count: counter.count + 1 } as any)
      .eq("id", counter.id);
    onUpdate();
  };

  const handleUndo = async () => {
    if (counter.count <= 0) return;
    await supabase
      .from("counters")
      .update({ count: counter.count - 1 } as any)
      .eq("id", counter.id);
    onUpdate();
  };

  const handleReset = async () => {
    await supabase
      .from("counters")
      .update({ start_date: new Date().toISOString(), last_reset: new Date().toISOString() } as any)
      .eq("id", counter.id);
    setConfirmReset(false);
    onUpdate();
  };

  return (
    <div className="border border-foreground bg-background p-3 flex flex-col gap-1.5">
      {/* Milestone banner */}
      {isMilestone && (
        <div className="flex items-center justify-between border border-foreground px-2 py-1 mb-1 animate-in fade-in duration-150">
          <p className="font-body text-[10px] text-foreground">{days} days. That matters.</p>
          <button
            onClick={() => setDismissedMilestone(true)}
            className="font-body text-[10px] text-muted-foreground hover:text-foreground ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Label */}
      <p className="font-body text-[11px] text-foreground leading-snug">{counter.label}</p>
      <p className="font-body text-[9px] text-muted-foreground">
        {counter.counter_type === "since" ? "time elapsed" : "count"}
      </p>

      {/* Value */}
      {counter.counter_type === "since" ? (
        <div className="mt-1">
          <p className="font-display text-[32px] text-foreground leading-none tabular-nums">
            {days} <span className="font-body text-[12px]">days</span>
          </p>
          <p className="font-body text-[9px] text-muted-foreground mt-1">
            since {formatShortDate(counter.start_date)}
          </p>

          {/* Reset */}
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="font-body text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-150 mt-2"
            >
              reset to today
            </button>
          ) : (
            <div className="mt-2 animate-in fade-in duration-150">
              <p className="font-body text-[9px] text-muted-foreground">
                Reset? This will start the count from today.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleReset}
                  className="font-body text-[9px] text-foreground hover:underline"
                >
                  yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="font-body text-[9px] text-muted-foreground hover:text-foreground"
                >
                  cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-1">
          <div className="flex items-end gap-2">
            <p className="font-display text-[32px] text-foreground leading-none tabular-nums">
              {displayCount}
            </p>
            <span className="font-body text-[12px] text-foreground mb-1">times</span>
            <button
              onClick={handleIncrement}
              className="font-body text-[18px] text-foreground border border-foreground w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors duration-150 mb-1 ml-auto"
            >
              +
            </button>
          </div>
          <p className="font-body text-[9px] text-muted-foreground mt-1">
            {resetMode === "monthly" ? "this month" : "total"}
          </p>
          {displayCount > 0 && (
            <button
              onClick={handleUndo}
              className="font-body text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-150 mt-1"
            >
              undo last
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main widget ── */
const CounterWidget = ({ widgetId, config }: Props) => {
  const [counters, setCounters] = useState<CounterRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCounters = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("counters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (data) {
      setCounters(data as any as CounterRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  // Store per-counter reset_mode in widget config
  const getResetMode = (counterId: string): string => {
    return (config?.resetModes as any)?.[counterId] || "total";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <p className="font-body text-[10px] text-muted-foreground">…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2 overflow-y-auto gap-3">
      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider">Counters</p>

      {counters.length === 0 && !creating && (
        <p className="font-body text-[11px] text-muted-foreground italic">No counters yet.</p>
      )}

      {counters.map((c) => (
        <CounterCard
          key={c.id}
          counter={c}
          resetMode={getResetMode(c.id)}
          onUpdate={loadCounters}
        />
      ))}

      {creating ? (
        <CreationForm onCreated={() => { setCreating(false); loadCounters(); }} />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start"
        >
          + Create counter
        </button>
      )}
    </div>
  );
};

export default CounterWidget;
