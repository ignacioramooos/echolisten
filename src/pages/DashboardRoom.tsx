import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { WidgetPalette, type WidgetType } from "@/components/echo/room/WidgetPalette";
import { RoomWidget } from "@/components/echo/room/RoomWidget";
import { RoomEmptyState } from "@/components/echo/room/RoomEmptyState";
import { useAppearance } from "@/hooks/use-appearance";
import { useRandomQuote, FALLBACK_QUOTES, type Quote } from "@/hooks/use-quote";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type LayoutItem = { i: string; x: number; y: number; w: number; h: number; minW?: number; maxW?: number; minH?: number; maxH?: number };

interface DashboardWidget {
  id: string;
  type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: Record<string, any>;
}

const PRESET_LAYOUTS: Record<string, { type: WidgetType; x: number; y: number; w: number; h: number }[]> = {
  calm: [
    { type: "mood_reflection", x: 0, y: 0, w: 2, h: 2 },
    { type: "emotional_weather", x: 2, y: 0, w: 2, h: 2 },
    { type: "sticky_note", x: 4, y: 0, w: 2, h: 2 },
  ],
  focused: [
    { type: "counter", x: 0, y: 0, w: 2, h: 2 },
    { type: "journal_quick", x: 2, y: 0, w: 3, h: 2 },
    { type: "one_thing_helped", x: 5, y: 0, w: 2, h: 1 },
  ],
  expressive: [
    { type: "today_i_am", x: 0, y: 0, w: 3, h: 2 },
    { type: "mood_reflection", x: 3, y: 0, w: 2, h: 2 },
    { type: "memory_shelf", x: 5, y: 0, w: 2, h: 3 },
    { type: "journal_quick", x: 0, y: 2, w: 3, h: 2 },
  ],
  steady: [
    { type: "breathe", x: 0, y: 0, w: 3, h: 2 },
    { type: "mood_reflection", x: 3, y: 0, w: 2, h: 2 },
    { type: "emotional_weather", x: 5, y: 0, w: 2, h: 2 },
  ],
};

const DashboardRoom = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { bgUrl, bgIntensity } = useAppearance();

  // Background quote state
  const [showBgQuote, setShowBgQuote] = useState(false);
  const [bgQuoteMode, setBgQuoteMode] = useState<"random" | "selected">("random");
  const [selectedQuoteIdx, setSelectedQuoteIdx] = useState(0);
  const { quote: randomQuote, loading: randomQuoteLoading, refresh: refreshRandomQuote } = useRandomQuote();

  const activeBgQuote: Quote | null = showBgQuote
    ? bgQuoteMode === "random"
      ? randomQuote
      : FALLBACK_QUOTES[selectedQuoteIdx]
    : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(el);
    setContainerWidth(el.clientWidth);
    return () => obs.disconnect();
  }, [loading]);

  const loadWidgets = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("dashboard_widgets")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });

    if (data) {
      setWidgets(
        data.map((d: any) => ({
          id: d.id,
          type: d.type,
          position_x: d.position_x ?? 0,
          position_y: d.position_y ?? 0,
          width: d.width ?? 2,
          height: d.height ?? 2,
          config: (d.config as Record<string, any>) || {},
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }
      setUserId(user.id);
      await loadWidgets(user.id);
    };
    init();
  }, [navigate, loadWidgets]);

  const addWidget = async (type: WidgetType) => {
    if (!userId) return;
    const maxY = widgets.reduce((max, w) => Math.max(max, w.position_y + w.height), 0);
    const { data, error } = await supabase
      .from("dashboard_widgets")
      .insert({
        user_id: userId,
        type: type as any,
        position_x: 0,
        position_y: maxY,
        width: 2,
        height: 2,
        config: {},
      } as any)
      .select()
      .single();

    if (!error && data) {
      setWidgets((prev) => [
        ...prev,
        {
          id: (data as any).id,
          type,
          position_x: 0,
          position_y: maxY,
          width: 2,
          height: 2,
          config: {},
        },
      ]);
    }
    setPaletteOpen(false);
  };

  const applyPreset = async (preset: "calm" | "focused" | "expressive" | "steady") => {
    if (!userId) return;
    const items = PRESET_LAYOUTS[preset];
    const inserts = items.map((item) => ({
      user_id: userId,
      type: item.type as any,
      position_x: item.x,
      position_y: item.y,
      width: item.w,
      height: item.h,
      config: {},
    }));

    const { data } = await supabase
      .from("dashboard_widgets")
      .insert(inserts as any)
      .select();

    if (data) {
      setWidgets(
        (data as any[]).map((d) => ({
          id: d.id,
          type: d.type,
          position_x: d.position_x,
          position_y: d.position_y,
          width: d.width,
          height: d.height,
          config: d.config || {},
        }))
      );
    }
  };

  const onLayoutChange = useCallback(
    (layout: readonly LayoutItem[], _layouts: any) => {
      layout.forEach((item) => {
        const widget = widgets.find((w) => w.id === item.i);
        if (
          widget &&
          (widget.position_x !== item.x ||
            widget.position_y !== item.y ||
            widget.width !== item.w ||
            widget.height !== item.h)
        ) {
          supabase
            .from("dashboard_widgets")
            .update({
              position_x: item.x,
              position_y: item.y,
              width: item.w,
              height: item.h,
            })
            .eq("id", item.i)
            .then();
        }
      });

      setWidgets((prev) =>
        prev.map((w) => {
          const l = layout.find((li) => li.i === w.id);
          if (!l) return w;
          return { ...w, position_x: l.x, position_y: l.y, width: l.w, height: l.h };
        })
      );
    },
    [widgets]
  );

  const gridLayout: LayoutItem[] = widgets.map((w) => ({
    i: w.id,
    x: w.position_x,
    y: w.position_y,
    w: w.width,
    h: w.height,
    minW: 1,
    maxW: 4,
    minH: 1,
    maxH: 3,
  }));

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="font-body text-[12px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background image layer */}
      {bgUrl && (
        <div
          className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgUrl})`, opacity: bgIntensity / 100 }}
        />
      )}

      {/* Background quote overlay */}
      {activeBgQuote && !randomQuoteLoading && (
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center px-8">
          <div className="text-center max-w-2xl">
            <p className="font-display italic text-[28px] sm:text-[40px] md:text-[52px] text-foreground opacity-[0.08] leading-tight">
              "{activeBgQuote.text}"
            </p>
            <p className="font-body text-[11px] sm:text-[13px] text-foreground opacity-[0.08] mt-3 tracking-wide">
              — {activeBgQuote.author}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b border-muted">
        <EchoLogo />
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/patterns")}
            className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            patterns
          </button>

          {/* Background quote control */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`font-body text-[11px] transition-colors duration-150 ${
                  showBgQuote
                    ? "text-foreground border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                quote
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[280px] bg-background border border-foreground p-0"
            >
              <div className="p-4 border-b border-muted">
                <div className="flex items-center justify-between">
                  <p className="font-display italic text-[15px] text-foreground">Background quote</p>
                  <button
                    onClick={() => setShowBgQuote((v) => !v)}
                    className={`font-body text-[10px] px-2.5 py-1 border transition-colors duration-150 ${
                      showBgQuote
                        ? "border-foreground bg-foreground text-background"
                        : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {showBgQuote ? "on" : "off"}
                  </button>
                </div>
                <p className="font-body text-[10px] text-muted-foreground mt-1">
                  Displays a quote subtly behind your widgets.
                </p>
              </div>

              {showBgQuote && (
                <div className="p-4 flex flex-col gap-3">
                  {/* Mode selector */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBgQuoteMode("random")}
                      className={`font-body text-[10px] px-3 py-1 border transition-colors duration-150 ${
                        bgQuoteMode === "random"
                          ? "border-foreground bg-foreground text-background"
                          : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      random
                    </button>
                    <button
                      onClick={() => setBgQuoteMode("selected")}
                      className={`font-body text-[10px] px-3 py-1 border transition-colors duration-150 ${
                        bgQuoteMode === "selected"
                          ? "border-foreground bg-foreground text-background"
                          : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      choose
                    </button>
                  </div>

                  {bgQuoteMode === "random" ? (
                    <div className="flex flex-col gap-2">
                      {randomQuote && (
                        <p className="font-display italic text-[13px] text-foreground leading-snug line-clamp-2">
                          "{randomQuote.text}"
                        </p>
                      )}
                      <button
                        onClick={refreshRandomQuote}
                        disabled={randomQuoteLoading}
                        className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start disabled:opacity-40"
                      >
                        ↺ new quote
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                      {FALLBACK_QUOTES.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedQuoteIdx(i)}
                          className={`text-left px-2 py-1.5 font-body text-[10px] leading-snug transition-colors duration-100 ${
                            selectedQuoteIdx === i
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          "{q.text}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setPaletteOpen(true)}
            className="font-body text-[12px] border border-foreground px-4 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
          >
            + Add widget
          </button>
        </div>
      </header>

      {/* Content */}
      <main ref={containerRef} className="flex-1 pt-[65px] px-4">
        {widgets.length === 0 ? (
          <div className="h-[calc(100vh-65px)]">
            <RoomEmptyState onSelectPreset={applyPreset} />
          </div>
        ) : (
          <ResponsiveGridLayout
            className="mt-4"
            width={containerWidth}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={120}
            margin={[16, 16]}
            layouts={{ lg: gridLayout }}
            onLayoutChange={onLayoutChange}
          >
            {widgets.map((w) => (
              <div
                key={w.id}
                className="border border-foreground bg-background animate-in fade-in duration-150"
              >
                <RoomWidget id={w.id} type={w.type} config={w.config} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </main>

      <WidgetPalette open={paletteOpen} onOpenChange={setPaletteOpen} onAdd={addWidget} />
    </div>
  );
};

export default DashboardRoom;
