import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRandomQuote } from "@/hooks/use-quote";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const QuoteWidget = ({ widgetId }: Props) => {
  const { quote, loading, refresh } = useRandomQuote();
  const [hovered, setHovered] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleRemove = async () => {
    await supabase.from("dashboard_widgets").delete().eq("id", widgetId);
  };

  return (
    <div
      className="h-full flex flex-col p-4 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setConfirmRemove(false);
      }}
    >
      {/* Hover action */}
      {hovered && !confirmRemove && (
        <div className="absolute top-2 right-2 animate-in fade-in duration-150 z-10">
          <button
            onClick={() => setConfirmRemove(true)}
            className="font-body text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            remove
          </button>
        </div>
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-4 z-10 animate-in fade-in duration-150">
          <p className="font-body text-[11px] text-foreground text-center mb-3">
            Remove this widget?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRemove}
              className="font-body text-[10px] text-foreground hover:underline"
            >
              yes, remove
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="font-body text-[10px] text-muted-foreground hover:text-foreground"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* Quote content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-2 overflow-hidden">
        {loading ? (
          <p className="font-body text-[11px] text-muted-foreground">…</p>
        ) : quote ? (
          <>
            <p className="font-display italic text-[18px] sm:text-[20px] text-foreground leading-snug">
              "{quote.text}"
            </p>
            <p className="font-body text-[11px] text-muted-foreground tracking-wide">
              — {quote.author}
            </p>
          </>
        ) : null}
      </div>

      {/* Refresh */}
      <div className="flex justify-end pt-2 shrink-0">
        <button
          onClick={refresh}
          disabled={loading}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1 disabled:opacity-40"
          title="Get a new quote"
        >
          <RefreshCw size={10} />
          new quote
        </button>
      </div>
    </div>
  );
};

export default QuoteWidget;
