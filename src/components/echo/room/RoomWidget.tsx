import { lazy, Suspense } from "react";

const StickyNoteWidget = lazy(() => import("./widgets/StickyNoteWidget"));
const MoodReflectionWidget = lazy(() => import("./widgets/MoodReflectionWidget"));
const CounterWidget = lazy(() => import("./widgets/CounterWidget"));
const QuickJournalWidget = lazy(() => import("./widgets/QuickJournalWidget"));
const EmotionalWeatherWidget = lazy(() => import("./widgets/EmotionalWeatherWidget"));
const TodayIAmWidget = lazy(() => import("./widgets/TodayIAmWidget"));
const MemoryShelfWidget = lazy(() => import("./widgets/MemoryShelfWidget"));
const OneThingHelpedWidget = lazy(() => import("./widgets/OneThingHelpedWidget"));
const BreatheWidget = lazy(() => import("./widgets/BreatheWidget"));
const QuoteWidget = lazy(() => import("./widgets/QuoteWidget"));

interface RoomWidgetProps {
  id: string;
  type: string;
  config: Record<string, any>;
}

const widgetMap: Record<string, React.ComponentType<{ widgetId: string; config: Record<string, any> }>> = {
  sticky_note: StickyNoteWidget,
  mood_reflection: MoodReflectionWidget,
  counter: CounterWidget,
  journal_quick: QuickJournalWidget,
  emotional_weather: EmotionalWeatherWidget,
  today_i_am: TodayIAmWidget,
  memory_shelf: MemoryShelfWidget,
  one_thing_helped: OneThingHelpedWidget,
  breathe: BreatheWidget,
  quote: QuoteWidget,
};

const RoomWidget = ({ id, type, config }: RoomWidgetProps) => {
  const Component = widgetMap[type];

  if (!Component) {
    return (
      <div className="h-full flex items-center justify-center p-3">
        <p className="font-body text-[11px] text-muted-foreground">Unknown widget</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          <p className="font-body text-[10px] text-muted-foreground">…</p>
        </div>
      }
    >
      <Component widgetId={id} config={config} />
    </Suspense>
  );
};

export { RoomWidget };
