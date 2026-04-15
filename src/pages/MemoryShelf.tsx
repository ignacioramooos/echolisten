import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";

interface ShelfEntry {
  id: string;
  content: string;
  label: string | null;
  created_at: string;
}

const FILTERS = ["all", "lessons", "truths", "things that helped"] as const;
type Filter = (typeof FILTERS)[number];

const filterToLabel = (f: Filter): string | null => {
  if (f === "all") return null;
  if (f === "things that helped") return "helped";
  return f.slice(0, -1); // "lessons" → "lesson", "truths" → "truth" — but keep as-is for matching
};

const MemoryShelfPage = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ShelfEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login", { replace: true }); return; }

    let query = supabase
      .from("memory_shelf")
      .select("id, content, label, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const labelFilter = filterToLabel(filter);
    if (labelFilter) {
      query = query.eq("label", labelFilter);
    }

    const { data } = await query;
    if (data) setEntries(data as ShelfEntry[]);
    setLoading(false);
  }, [filter, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (id: string) => {
    await supabase.from("memory_shelf").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLabelSave = async (id: string) => {
    await supabase
      .from("memory_shelf")
      .update({ label: editLabel.trim() || null } as any)
      .eq("id", id);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, label: editLabel.trim() || null } : e))
    );
    setEditingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b border-muted">
        <EchoLogo />
        <button
          onClick={() => navigate("/dashboard/room")}
          className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ← back to room
        </button>
      </header>

      <main className="flex-1 pt-[65px] max-w-[640px] mx-auto w-full px-6 py-8">
        <h1 className="font-display italic text-[32px] text-foreground mb-6">Memory Shelf</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-8 border-b border-muted pb-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`font-body text-[11px] transition-all duration-100 ${
                filter === f
                  ? "text-foreground font-medium border-b border-foreground -mb-[13px] pb-[12px]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-body text-[12px] text-muted-foreground">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="font-body text-[12px] text-muted-foreground italic">
            {filter === "all" ? "Nothing saved yet." : `No entries with label "${filter}".`}
          </p>
        ) : (
          <div className="flex flex-col gap-0">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-muted py-4 group"
              >
                <p className="font-body text-[13px] text-foreground leading-relaxed">
                  {entry.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="font-body text-[10px] text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>

                  {/* Label */}
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLabelSave(entry.id)}
                        placeholder="label"
                        autoFocus
                        className="font-body text-[10px] text-foreground bg-transparent border-b border-foreground focus:outline-none w-[80px] pb-0"
                      />
                      <button
                        onClick={() => handleLabelSave(entry.id)}
                        className="font-body text-[9px] text-foreground hover:underline"
                      >
                        save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="font-body text-[9px] text-muted-foreground hover:text-foreground"
                      >
                        cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(entry.id); setEditLabel(entry.label || ""); }}
                      className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {entry.label ? `#${entry.label}` : "add label"}
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 opacity-0 group-hover:opacity-100"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MemoryShelfPage;
