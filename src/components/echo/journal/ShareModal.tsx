import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Visibility = "shared_full" | "shared_summary" | "shared_sentence";

const OPTIONS: { value: Visibility; label: string }[] = [
  { value: "shared_full", label: "Share the full entry" },
  { value: "shared_summary", label: "Share a summary" },
  { value: "shared_sentence", label: "Share one sentence" },
];

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryContent: string;
}

const ShareModal = ({ open, onOpenChange, entryId, entryContent }: ShareModalProps) => {
  const [visibility, setVisibility] = useState<Visibility | null>(null);
  const [fragment, setFragment] = useState("");
  const [saved, setSaved] = useState(false);

  const selectOption = (v: Visibility) => {
    setVisibility(v);
    if (v === "shared_full") setFragment(entryContent);
    else if (v === "shared_sentence") setFragment(entryContent.split(/[.!?]/)[0] || "");
    else setFragment("");
  };

  const submit = async () => {
    if (!visibility) return;
    await supabase
      .from("journal_entries")
      .update({
        visibility: visibility as any,
        shared_fragment: fragment || null,
      } as any)
      .eq("id", entryId);
    setSaved(true);
    setTimeout(() => { onOpenChange(false); setSaved(false); setVisibility(null); }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-foreground p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display italic text-[18px] text-foreground">
            Share with a Listener
          </DialogTitle>
        </DialogHeader>

        {!visibility ? (
          <div className="flex flex-col gap-2 mt-4">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectOption(opt.value)}
                className="text-left font-body text-[12px] text-foreground border border-muted px-4 py-3 hover:border-foreground transition-colors duration-150"
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <p className="font-body text-[11px] text-muted-foreground mb-2">
              {visibility === "shared_full" ? "Full entry will be shared." : "Edit what you'd like to share:"}
            </p>
            {visibility !== "shared_full" && (
              <textarea
                value={fragment}
                onChange={(e) => setFragment(e.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent font-body text-[12px] text-foreground border-b border-muted focus:outline-none pb-2"
              />
            )}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setVisibility(null)}
                className="font-body text-[11px] text-muted-foreground underline"
              >
                Back
              </button>
              {saved ? (
                <p className="font-body text-[11px] text-muted-foreground">Shared ✓</p>
              ) : (
                <button
                  onClick={submit}
                  className="font-body text-[12px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150"
                >
                  Share
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ShareModal };
