import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ShelfEntry {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const MemoryShelfWidget = ({ widgetId, config }: Props) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ShelfEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("memory_shelf")
      .select("id, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setEntries(data as ShelfEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <p className="font-body text-[10px] text-muted-foreground">…</p>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
        Memory Shelf
      </p>

      {entries.length === 0 ? (
        <p className="font-body text-[11px] text-muted-foreground italic flex-1">
          Nothing saved yet.
        </p>
      ) : (
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-2">
              <p className="font-body text-[11px] text-foreground leading-snug min-w-0 truncate flex-1">
                {e.content.length > 80 ? e.content.slice(0, 80) + "…" : e.content}
              </p>
              <p className="font-body text-[9px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                {formatDate(e.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard/shelf")}
        className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start mt-2"
      >
        View all →
      </button>
    </div>
  );
};

export default MemoryShelfWidget;
