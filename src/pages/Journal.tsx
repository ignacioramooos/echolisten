import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { ModeSelector } from "@/components/echo/journal/ModeSelector";
import { MoodCheckin } from "@/components/echo/journal/MoodCheckin";
import { JournalSidebar } from "@/components/echo/journal/JournalSidebar";
import { ShelfModal } from "@/components/echo/journal/ShelfModal";
import { ShareModal } from "@/components/echo/journal/ShareModal";
import { FreeEditor } from "@/components/echo/journal/modes/FreeEditor";
import { GuidedEditor } from "@/components/echo/journal/modes/GuidedEditor";
import { BulletEditor } from "@/components/echo/journal/modes/BulletEditor";
import { UnspeakableEditor } from "@/components/echo/journal/modes/UnspeakableEditor";
import { OneSentenceEditor } from "@/components/echo/journal/modes/OneSentenceEditor";
import { PromptedEditor } from "@/components/echo/journal/modes/PromptedEditor";
import type { JournalMode } from "@/components/echo/journal/journalData";
import { useIsMobile } from "@/hooks/use-mobile";

interface JournalEntry {
  id: string;
  mode: string;
  content: string | null;
  mood_before: string | null;
  mood_after: string | null;
  created_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<JournalMode>("free");
  const [content, setContent] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [moodBefore, setMoodBefore] = useState<string | null>(null);
  const [moodAfter, setMoodAfter] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Post-save state
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState("");
  const [showPostSave, setShowPostSave] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Sidebar & read-only
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const loadEntries = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("journal_entries")
      .select("id, mode, content, mood_before, mood_after, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setEntries(data as JournalEntry[]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }
      setUserId(user.id);
      await loadEntries(user.id);
    };
    init();
  }, [navigate, loadEntries]);

  const resetEditor = () => {
    setContent("");
    setEmotionTags([]);
    setMoodBefore(null);
    setMoodAfter(null);
    setShowPostSave(false);
    setSavedEntryId(null);
    setViewingEntry(null);
  };

  const switchMode = (m: JournalMode) => {
    setMode(m);
    setContent("");
    setEmotionTags([]);
    setShowPostSave(false);
    setSavedEntryId(null);
    setViewingEntry(null);
  };

  const handleSave = async () => {
    if (!userId || !content.trim()) return;
    setSaving(true);

    let finalContent = content;
    if (mode === "unspeakable" && emotionTags.length > 0) {
      finalContent = content + "\n\n[tags: " + emotionTags.join(", ") + "]";
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        mode: mode as any,
        content: finalContent,
        mood_before: moodBefore,
        visibility: "private" as any,
      } as any)
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      const entry = data as any;
      setSavedEntryId(entry.id);
      setSavedContent(finalContent);
      setShowPostSave(true);
      await loadEntries(userId);
    }
  };

  const handleMoodAfter = async (mood: string) => {
    setMoodAfter(mood);
    if (savedEntryId) {
      await supabase
        .from("journal_entries")
        .update({ mood_after: mood } as any)
        .eq("id", savedEntryId);
    }
  };

  const handleViewEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setViewingEntry(entry);
      setShowPostSave(false);
      setSavedEntryId(null);
    }
  };

  const handleDeleteEntry = async () => {
    if (!viewingEntry) return;
    await supabase.from("journal_entries").delete().eq("id", viewingEntry.id);
    setViewingEntry(null);
    if (userId) await loadEntries(userId);
  };

  const renderEditor = () => {
    switch (mode) {
      case "free":
        return <FreeEditor value={content} onChange={setContent} />;
      case "guided":
        return <GuidedEditor value={content} onChange={setContent} />;
      case "bullet":
        return <BulletEditor value={content} onChange={setContent} />;
      case "unspeakable":
        return (
          <UnspeakableEditor
            value={content}
            onChange={setContent}
            tags={emotionTags}
            onTagsChange={setEmotionTags}
          />
        );
      case "one_sentence":
        return <OneSentenceEditor value={content} onChange={setContent} />;
      case "prompted":
        return <PromptedEditor value={content} onChange={setContent} />;
      default:
        return null;
    }
  };

  const modeLabels: Record<string, string> = {
    free: "Free",
    guided: "Guided",
    bullet: "Bullet",
    unspeakable: "Unspeakable",
    one_sentence: "One Sentence",
    prompted: "Prompted",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b border-muted">
        <EchoLogo />
        <button
          onClick={() => { resetEditor(); setViewingEntry(null); }}
          className="font-body text-[12px] border border-foreground px-4 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
        >
          + New entry
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 pt-[65px]">
        {/* Sidebar — desktop only */}
        {!isMobile && (
          <JournalSidebar
            entries={entries}
            activeId={viewingEntry?.id || null}
            onSelect={handleViewEntry}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 flex flex-col max-w-[720px] mx-auto w-full px-6 py-8 ${!isMobile && sidebarCollapsed ? "ml-6" : ""}`}>
          {viewingEntry ? (
            /* Read-only view */
            <div className="animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-body text-[10px] text-muted-foreground">
                  {new Date(viewingEntry.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="font-body text-[10px] text-muted-foreground">·</p>
                <p className="font-body text-[10px] text-muted-foreground">
                  {modeLabels[viewingEntry.mode] || viewingEntry.mode}
                </p>
              </div>
              {viewingEntry.mood_before && (
                <p className="font-body text-[11px] text-muted-foreground mb-4">
                  Mood before: {viewingEntry.mood_before}
                </p>
              )}
              <div className="font-body text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                {viewingEntry.content || ""}
              </div>
              {viewingEntry.mood_after && (
                <p className="font-body text-[11px] text-muted-foreground mt-6">
                  Mood after: {viewingEntry.mood_after}
                </p>
              )}
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => setViewingEntry(null)}
                  className="font-body text-[11px] text-muted-foreground underline"
                >
                  Back to writing
                </button>
                <button
                  onClick={handleDeleteEntry}
                  className="font-body text-[11px] text-muted-foreground underline hover:text-foreground transition-colors duration-150"
                >
                  Delete this entry
                </button>
              </div>
            </div>
          ) : (
            /* Writing view */
            <div className="animate-in fade-in duration-150 flex flex-col flex-1">
              {/* Mode selector */}
              <ModeSelector active={mode} onChange={switchMode} />

              {/* Mood before */}
              <div className="mt-6 mb-6">
                <MoodCheckin
                  label="Right now I feel —"
                  value={moodBefore}
                  onChange={setMoodBefore}
                />
              </div>

              {/* Editor */}
              <div className="flex-1">{renderEditor()}</div>

              {/* Post-save actions */}
              {showPostSave && savedEntryId ? (
                <div className="mt-8 animate-in fade-in duration-150">
                  {/* Mood after */}
                  <div className="mb-6">
                    <MoodCheckin
                      label="After writing, I feel —"
                      value={moodAfter}
                      onChange={handleMoodAfter}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { resetEditor(); }}
                      className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      Keep this for yourself
                    </button>
                    <span className="font-body text-[11px] text-muted-foreground">·</span>
                    <button
                      onClick={() => setShelfOpen(true)}
                      className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      Save a line to your shelf
                    </button>
                    <span className="font-body text-[11px] text-muted-foreground">·</span>
                    <button
                      onClick={() => setShareOpen(true)}
                      className="font-body text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      Share with a Listener
                    </button>
                  </div>
                </div>
              ) : (
                /* Save button */
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSave}
                    disabled={!content.trim() || saving}
                    className="font-body text-[12px] bg-foreground text-background px-5 py-2 hover:opacity-80 transition-opacity duration-150 disabled:opacity-30"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {savedEntryId && userId && (
        <>
          <ShelfModal
            open={shelfOpen}
            onOpenChange={setShelfOpen}
            entryId={savedEntryId}
            entryContent={savedContent}
            userId={userId}
          />
          <ShareModal
            open={shareOpen}
            onOpenChange={setShareOpen}
            entryId={savedEntryId}
            entryContent={savedContent}
            onShared={() => setShowPostSave(false)}
          />
        </>
      )}
    </div>
  );
};

export default Journal;
