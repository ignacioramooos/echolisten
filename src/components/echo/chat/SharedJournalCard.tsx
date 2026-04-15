import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SharedEntry {
  id: string;
  shared_fragment: string;
  visibility: string;
  created_at: string;
}

interface SharedJournalCardProps {
  seekerId: string;
  seekerName: string;
  listenerId: string;
  onContinue: () => void;
}

const SharedJournalCard = ({ seekerId, seekerName, listenerId, onContinue }: SharedJournalCardProps) => {
  const [entries, setEntries] = useState<SharedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("id, shared_fragment, visibility, created_at")
        .eq("user_id", seekerId)
        .eq("listener_id", listenerId)
        .neq("visibility", "private")
        .is("read_at" as any, null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setEntries(data as any[]);
      setLoading(false);
    };
    load();
  }, [seekerId, listenerId]);

  const markAsRead = async () => {
    const ids = entries.map((e) => e.id);
    if (ids.length > 0) {
      await supabase
        .from("journal_entries")
        .update({ read_at: new Date().toISOString() } as any)
        .in("id", ids);
    }
  };

  const handleContinue = async () => {
    await markAsRead();
    onContinue();
  };

  const handleSkip = async () => {
    await markAsRead();
    setDismissed(true);
    onContinue();
  };

  if (loading) return null;
  if (entries.length === 0 || dismissed) return null;

  return (
    <div className="animate-in fade-in duration-150 max-w-[480px] mx-auto p-6">
      <p className="font-body text-[12px] text-muted-foreground mb-4">
        {seekerName} shared something before this session.
      </p>

      {entries.map((entry) => (
        <div key={entry.id} className="border border-muted p-4 mb-3">
          <p className="font-body text-[12px] text-foreground whitespace-pre-wrap leading-relaxed">
            {entry.shared_fragment}
          </p>
        </div>
      ))}

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleContinue}
          className="font-body text-[12px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150"
        >
          Continue to session →
        </button>
        <button
          onClick={handleSkip}
          className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          Skip →
        </button>
      </div>
    </div>
  );
};

export { SharedJournalCard };
