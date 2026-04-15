import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ── Weather scale ── */
const WEATHER_MAP: Record<string, number> = {
  stormy: 1,
  heavy: 2,
  foggy: 3,
  cloudy: 4,
  warming_up: 5,
  clear: 6,
};
const WEATHER_LABELS: Record<number, string> = {
  1: "stormy",
  2: "heavy",
  3: "foggy",
  4: "cloudy",
  5: "warming up",
  6: "clear",
};

/* ── Mood valence (higher = more positive) ── */
const MOOD_VALENCE: Record<string, number> = {
  angry: 1,
  overwhelmed: 2,
  sad: 2,
  anxious: 3,
  confused: 3,
  numb: 3,
  tired: 4,
  okay: 5,
  calm: 6,
  hopeful: 7,
  grateful: 7,
  happy: 8,
};

/* ── Helpers ── */
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const formatShort = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const dateKey = (d: string) => new Date(d).toISOString().slice(0, 10);

/* ── Page ── */
const PatternsPage = () => {
  const navigate = useNavigate();

  const [moodData, setMoodData] = useState<{ date: string; value: number; label: string }[]>([]);
  const [journalDays, setJournalDays] = useState<Set<string>>(new Set());
  const [journalCount, setJournalCount] = useState(0);
  const [beforeAfter, setBeforeAfter] = useState<{ mood_before: string; mood_after: string; created_at: string }[]>([]);
  const [helped, setHelped] = useState<{ content: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login", { replace: true }); return; }

    const thirtyDaysAgo = daysAgo(30);
    const ninetyDaysAgo = daysAgo(90);

    // Mood logs (30 days)
    const { data: moods } = await supabase
      .from("mood_logs")
      .select("emotional_weather, created_at")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    if (moods) {
      setMoodData(
        (moods as any[])
          .filter((m) => m.emotional_weather && WEATHER_MAP[m.emotional_weather])
          .map((m) => ({
            date: formatShort(m.created_at),
            value: WEATHER_MAP[m.emotional_weather],
            label: m.emotional_weather.replace("_", " "),
          }))
      );
    }

    // Journal entries (90 days)
    const { data: journals } = await supabase
      .from("journal_entries")
      .select("created_at, mood_before, mood_after")
      .eq("user_id", user.id)
      .gte("created_at", ninetyDaysAgo)
      .order("created_at", { ascending: false });

    if (journals) {
      const days = new Set((journals as any[]).map((j) => dateKey(j.created_at)));
      setJournalDays(days);
      setJournalCount(journals.length);

      const ba = (journals as any[])
        .filter((j) => j.mood_before && j.mood_after)
        .slice(0, 10);
      setBeforeAfter(ba);
    }

    // Memory shelf — helped
    const { data: helpedData } = await supabase
      .from("memory_shelf")
      .select("content, created_at")
      .eq("user_id", user.id)
      .eq("label", "helped")
      .order("created_at", { ascending: false })
      .limit(10);

    if (helpedData) setHelped(helpedData as any[]);

    setLoading(false);
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  /* ── Before/After summary ── */
  const baSummary = useMemo(() => {
    if (beforeAfter.length === 0) return null;
    let improved = 0;
    beforeAfter.forEach((ba) => {
      const before = MOOD_VALENCE[ba.mood_before] || 5;
      const after = MOOD_VALENCE[ba.mood_after] || 5;
      if (after > before) improved++;
    });
    return { improved, total: beforeAfter.length };
  }, [beforeAfter]);

  /* ── Contribution grid (90 days) ── */
  const gridDays = useMemo(() => {
    const days: { date: string; key: string; filled: boolean }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        key,
        filled: journalDays.has(key),
      });
    }
    return days;
  }, [journalDays]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="font-body text-[12px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b border-muted">
        <EchoLogo />
        <button
          onClick={() => navigate("/dashboard/room")}
          className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ← back to room
        </button>
      </header>

      <main className="flex-1 pt-[65px] max-w-[720px] mx-auto w-full px-6 py-8">
        <h1 className="font-display italic text-[32px] text-foreground mb-10">Patterns</h1>

        {/* 1. Mood Over Time */}
        <section className="mb-12">
          <h2 className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
            Mood Over Time
          </h2>
          {moodData.length === 0 ? (
            <p className="font-body text-[11px] text-muted-foreground italic">
              No mood data in the last 30 days.
            </p>
          ) : (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fontFamily: "DM Mono", fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--muted))" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1, 6]}
                    ticks={[1, 2, 3, 4, 5, 6]}
                    tickFormatter={(v: number) => WEATHER_LABELS[v] || ""}
                    tick={{ fontSize: 9, fontFamily: "DM Mono", fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--muted))" }}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--foreground))",
                      fontSize: 11,
                      fontFamily: "DM Mono",
                    }}
                    formatter={(value: number) => [WEATHER_LABELS[value] || value, "mood"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: "hsl(var(--foreground))" }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* 2. Journal Frequency */}
        <section className="mb-12">
          <h2 className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
            Journal Frequency
          </h2>
          <div className="flex flex-wrap gap-[3px]">
            {gridDays.map((d) => (
              <div
                key={d.key}
                title={d.date}
                className={`w-[10px] h-[10px] border ${
                  d.filled
                    ? "bg-foreground border-foreground"
                    : "bg-transparent border-muted"
                }`}
              />
            ))}
          </div>
          <p className="font-body text-[11px] text-muted-foreground mt-3">
            You've written {journalCount} times in the last 90 days.
          </p>
        </section>

        {/* 3. Before / After */}
        <section className="mb-12">
          <h2 className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
            Before / After
          </h2>
          {beforeAfter.length === 0 ? (
            <p className="font-body text-[11px] text-muted-foreground italic">
              No entries with both mood checks yet.
            </p>
          ) : (
            <>
              {baSummary && (
                <p className="font-body text-[12px] text-foreground mb-4">
                  Writing shifted how you felt {baSummary.improved} out of {baSummary.total} times.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {beforeAfter.map((ba, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <p className="font-body text-[11px] text-muted-foreground">
                      {formatShort(ba.created_at)}
                    </p>
                    <p className="font-body text-[11px] text-foreground">
                      {ba.mood_before}
                    </p>
                    <span className="font-body text-[11px] text-muted-foreground">→</span>
                    <p className="font-body text-[11px] text-foreground">
                      {ba.mood_after}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 4. What Helps */}
        <section className="mb-12">
          <h2 className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
            What Helps
          </h2>
          {helped.length === 0 ? (
            <p className="font-body text-[11px] text-muted-foreground italic">
              Nothing saved yet. Use the "One Thing That Helped" widget to start.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {helped.map((h, i) => (
                <div key={i} className="flex items-start justify-between gap-3 border-b border-muted pb-2">
                  <p className="font-body text-[12px] text-foreground leading-snug">
                    {h.content}
                  </p>
                  <p className="font-body text-[9px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                    {formatShort(h.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PatternsPage;
