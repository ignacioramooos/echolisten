import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ShelfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryContent: string;
  userId: string;
}

const ShelfModal = ({ open, onOpenChange, entryId, entryContent, userId }: ShelfModalProps) => {
  const [fragment, setFragment] = useState(entryContent.slice(0, 100));
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!fragment.trim()) return;
    await supabase.from("memory_shelf").insert({
      user_id: userId,
      source_entry_id: entryId,
      content: fragment.trim(),
    } as any);
    setSaved(true);
    setTimeout(() => { onOpenChange(false); setSaved(false); }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-foreground p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display italic text-[18px] text-foreground">
            Save to your shelf
          </DialogTitle>
        </DialogHeader>
        <p className="font-body text-[11px] text-muted-foreground mt-2">
          Type or paste the fragment you want to keep.
        </p>
        <textarea
          value={fragment}
          onChange={(e) => setFragment(e.target.value)}
          rows={3}
          className="w-full resize-none bg-transparent font-body text-[12px] text-foreground border-b border-muted focus:outline-none mt-3 pb-2"
        />
        <div className="flex justify-end mt-4">
          {saved ? (
            <p className="font-body text-[11px] text-muted-foreground">Saved ✓</p>
          ) : (
            <button
              onClick={save}
              disabled={!fragment.trim()}
              className="font-body text-[12px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-30"
            >
              Save
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ShelfModal };
