import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ShareType = "shared_full" | "shared_summary" | "shared_sentence";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId: string;
  entryContent: string;
  onShared?: () => void;
}

interface ListenerInfo {
  user_id: string;
  username: string | null;
  first_name: string | null;
}

const ShareModal = ({ open, onOpenChange, entryId, entryContent, onShared }: ShareModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [shareType, setShareType] = useState<ShareType | null>(null);
  const [fragment, setFragment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [listener, setListener] = useState<ListenerInfo | null>(null);
  const [listenerLoading, setListenerLoading] = useState(false);
  const [shareMode, setShareMode] = useState<"before_session" | "without_session">("before_session");

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setShareType(null);
      setFragment("");
      setSent(false);
      setLoading(false);
    }
  }, [open]);

  // Load assigned listener
  useEffect(() => {
    if (!open) return;
    const loadListener = async () => {
      setListenerLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setListenerLoading(false); return; }

      // Find the most recent active session with a listener for this seeker
      const { data: sessions } = await supabase
        .from("sessions")
        .select("listener_id")
        .eq("seeker_id", user.id)
        .not("listener_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0 && sessions[0].listener_id) {
        const { data: profile } = await supabase
          .from("listener_profiles")
          .select("user_id, username, first_name")
          .eq("user_id", sessions[0].listener_id)
          .single();
        if (profile) setListener(profile as ListenerInfo);
      }
      setListenerLoading(false);
    };
    loadListener();
  }, [open]);

  const selectType = async (type: ShareType) => {
    setShareType(type);

    if (type === "shared_full") {
      setFragment(entryContent);
      setStep(2);
    } else if (type === "shared_summary") {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("journal-summarize", {
          body: { content: entryContent },
        });
        if (error) throw error;
        setFragment(data?.summary || entryContent.slice(0, 200));
      } catch {
        toast.error("Couldn't generate summary. You can edit manually.");
        setFragment(entryContent.slice(0, 200));
      }
      setLoading(false);
      setStep(2);
    } else {
      // One sentence — pre-fill first sentence
      const firstSentence = entryContent.split(/[.!?]/)[0]?.trim() || "";
      setFragment(firstSentence);
      setStep(2);
    }
  };

  const handleSend = async () => {
    if (!fragment.trim()) return;
    setSending(true);

    const updatePayload: Record<string, any> = {
      visibility: shareType,
      shared_fragment: fragment.trim(),
    };

    if (listener) {
      updatePayload.listener_id = listener.user_id;
    }

    const { error } = await supabase
      .from("journal_entries")
      .update(updatePayload as any)
      .eq("id", entryId);

    setSending(false);

    if (error) {
      toast.error("Something went wrong.");
      return;
    }

    setSent(true);
    setTimeout(() => {
      onOpenChange(false);
      onShared?.();
    }, 1200);
  };

  const listenerName = listener?.username || listener?.first_name || "your Listener";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-foreground p-0 max-w-md [&>button]:hidden">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 font-body text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          ×
        </button>

        <div className="p-6">
          {sent ? (
            <div className="animate-in fade-in duration-150 py-8 text-center">
              <p className="font-body text-[13px] text-foreground">Shared.</p>
            </div>
          ) : step === 1 ? (
            /* Step 1 — Choose what to share */
            <div className="animate-in fade-in duration-150">
              <h2 className="font-display italic text-[18px] text-foreground mb-6">
                What do you want to share?
              </h2>

              <div className="flex flex-col gap-2">
                {[
                  { type: "shared_full" as ShareType, label: "The full entry" },
                  { type: "shared_summary" as ShareType, label: "A summary" },
                  { type: "shared_sentence" as ShareType, label: "One sentence" },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => selectType(opt.type)}
                    disabled={loading}
                    className="text-left font-body text-[12px] text-foreground border border-muted px-4 py-3 hover:border-foreground transition-colors duration-150 disabled:opacity-40"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {loading && (
                <p className="font-body text-[10px] text-muted-foreground mt-4 animate-in fade-in duration-150">
                  Generating summary…
                </p>
              )}
            </div>
          ) : (
            /* Step 2 — Review & confirm */
            <div className="animate-in fade-in duration-150">
              <h2 className="font-display italic text-[18px] text-foreground mb-4">
                Review
              </h2>

              {/* Fragment preview */}
              <div className="border border-muted p-3 mb-4">
                {shareType === "shared_full" ? (
                  <p className="font-body text-[11px] text-foreground whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                    {fragment}
                  </p>
                ) : (
                  <textarea
                    value={fragment}
                    onChange={(e) => setFragment(e.target.value)}
                    rows={3}
                    className="w-full resize-none bg-transparent font-body text-[11px] text-foreground focus:outline-none leading-relaxed"
                    placeholder="Edit what you'd like to share…"
                  />
                )}
              </div>

              {/* Recipient */}
              <div className="mb-4">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Who do you want to share this with?
                </p>
                {listenerLoading ? (
                  <p className="font-body text-[11px] text-muted-foreground">Loading…</p>
                ) : listener ? (
                  <p className="font-body text-[12px] text-foreground">{listenerName}</p>
                ) : (
                  <p className="font-body text-[11px] text-muted-foreground">
                    You don't have a Listener yet.{" "}
                    <button
                      onClick={() => { onOpenChange(false); }}
                      className="underline hover:text-foreground transition-colors duration-150"
                    >
                      Request one →
                    </button>
                  </p>
                )}
              </div>

              {/* Share mode toggle */}
              {listener && (
                <div className="flex gap-3 mb-6">
                  {(["before_session", "without_session"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setShareMode(mode)}
                      className={`font-body text-[10px] pb-0.5 transition-all duration-100 ${
                        shareMode === mode
                          ? "text-foreground border-b border-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode === "before_session" ? "Share before a session" : "Share without a session"}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep(1); setShareType(null); }}
                  className="font-body text-[11px] text-muted-foreground underline"
                >
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={!fragment.trim() || sending}
                  className="font-body text-[12px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150 disabled:opacity-30"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          )}

          {/* Privacy notice */}
          {!sent && (
            <p className="font-body text-[9px] text-muted-foreground mt-6 leading-snug">
              You control what is shared. Your full journal stays private unless you choose otherwise.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ShareModal };
