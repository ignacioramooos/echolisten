import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

type StickyMode = "text" | "youtube" | "spotify" | "quote";

/* ── Helpers ── */
const extractYoutubeId = (url: string): string | null => {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
};

const toSpotifyEmbed = (
  url: string
): { embedUrl: string; type: "track" | "playlist" } | null => {
  const m = url.match(
    /open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/
  );
  if (!m) return null;
  const kind = m[1] === "playlist" || m[1] === "album" ? "playlist" : "track";
  return {
    embedUrl: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`,
    type: kind,
  };
};

/* ── Creation / Edit modal ── */
const StickyModal = ({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Record<string, any> | null;
  onSave: (cfg: Record<string, any>) => void;
}) => {
  const initMode = (initial?.stickyMode as StickyMode) || null;
  const [mode, setMode] = useState<StickyMode | null>(initMode);

  // text
  const [text, setText] = useState((initial?.text as string) || "");
  // youtube
  const [ytUrl, setYtUrl] = useState((initial?.ytUrl as string) || "");
  const [ytCaption, setYtCaption] = useState((initial?.ytCaption as string) || "");
  const [ytError, setYtError] = useState("");
  // spotify
  const [spUrl, setSpUrl] = useState((initial?.spUrl as string) || "");
  const [spCaption, setSpCaption] = useState((initial?.spCaption as string) || "");
  const [spError, setSpError] = useState("");
  // quote
  const [quote, setQuote] = useState((initial?.quote as string) || "");
  const [attribution, setAttribution] = useState((initial?.attribution as string) || "");

  const save = () => {
    if (!mode) return;
    const cfg: Record<string, any> = { stickyMode: mode, initialized: true };

    if (mode === "text") {
      cfg.text = text;
    } else if (mode === "youtube") {
      const vid = extractYoutubeId(ytUrl);
      if (!vid) { setYtError("Invalid YouTube URL"); return; }
      cfg.ytUrl = ytUrl;
      cfg.ytVideoId = vid;
      cfg.ytCaption = ytCaption;
    } else if (mode === "spotify") {
      const embed = toSpotifyEmbed(spUrl);
      if (!embed) { setSpError("Invalid Spotify URL"); return; }
      cfg.spUrl = spUrl;
      cfg.spEmbedUrl = embed.embedUrl;
      cfg.spType = embed.type;
      cfg.spCaption = spCaption;
    } else if (mode === "quote") {
      cfg.quote = quote;
      cfg.attribution = attribution;
    }

    onSave(cfg);
  };

  const modes: { id: StickyMode; label: string; desc: string }[] = [
    { id: "text", label: "Note", desc: "Write anything." },
    { id: "youtube", label: "Video", desc: "Embed a YouTube video." },
    { id: "spotify", label: "Music", desc: "Embed a Spotify track or playlist." },
    { id: "quote", label: "Quote", desc: "A sentence to keep." },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-foreground p-6 max-w-md">
        {!mode ? (
          <>
            <p className="font-display italic text-[18px] text-foreground mb-4">
              What do you want to add?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="border border-foreground p-4 text-left hover:bg-foreground hover:text-background transition-colors duration-150 group"
                >
                  <p className="font-body text-[12px] text-foreground group-hover:text-background">
                    {m.label}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground group-hover:text-background/70 mt-1">
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="font-display italic text-[16px] text-foreground">
                {modes.find((m) => m.id === mode)?.label}
              </p>
              {!initial?.initialized && (
                <button
                  onClick={() => setMode(null)}
                  className="font-body text-[10px] text-muted-foreground hover:text-foreground"
                >
                  ← back
                </button>
              )}
            </div>

            {mode === "text" && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={text}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setText(e.target.value);
                  }}
                  placeholder="Write anything here…"
                  rows={6}
                  className="w-full resize-none bg-transparent font-body text-[13px] text-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-2"
                />
                <p className="font-body text-[9px] text-muted-foreground text-right">
                  {text.length}/500
                </p>
              </div>
            )}

            {mode === "youtube" && (
              <div className="flex flex-col gap-3">
                <input
                  value={ytUrl}
                  onChange={(e) => { setYtUrl(e.target.value); setYtError(""); }}
                  placeholder="Paste a YouTube link"
                  className="w-full bg-transparent font-body text-[12px] text-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
                />
                {ytError && (
                  <p className="font-body text-[10px] text-foreground">{ytError}</p>
                )}
                <input
                  value={ytCaption}
                  onChange={(e) => setYtCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full bg-transparent font-body text-[11px] text-muted-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
                />
              </div>
            )}

            {mode === "spotify" && (
              <div className="flex flex-col gap-3">
                <input
                  value={spUrl}
                  onChange={(e) => { setSpUrl(e.target.value); setSpError(""); }}
                  placeholder="Paste a Spotify track or playlist link"
                  className="w-full bg-transparent font-body text-[12px] text-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
                />
                {spError && (
                  <p className="font-body text-[10px] text-foreground">{spError}</p>
                )}
                <input
                  value={spCaption}
                  onChange={(e) => setSpCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full bg-transparent font-body text-[11px] text-muted-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
                />
              </div>
            )}

            {mode === "quote" && (
              <div className="flex flex-col gap-3">
                <textarea
                  value={quote}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) setQuote(e.target.value);
                  }}
                  placeholder="The sentence you want to keep."
                  rows={3}
                  className="w-full resize-none bg-transparent font-body text-[13px] text-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-2"
                />
                <p className="font-body text-[9px] text-muted-foreground text-right">
                  {quote.length}/200
                </p>
                <input
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  placeholder="— attribution (optional)"
                  className="w-full bg-transparent font-body text-[11px] text-muted-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
                />
              </div>
            )}

            <button
              onClick={save}
              className="self-end font-body text-[11px] bg-foreground text-background px-4 py-1.5 hover:opacity-80 transition-opacity duration-150 mt-4"
            >
              Save
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ── Rendered views ── */
const TextView = ({ text }: { text: string }) => (
  <div className="whitespace-pre-wrap font-body text-[14px] text-foreground leading-relaxed">
    {text}
  </div>
);

const YoutubeView = ({ videoId, caption }: { videoId: string; caption?: string }) => (
  <div className="flex flex-col gap-2">
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
    {caption && (
      <p className="font-body text-[10px] text-muted-foreground">{caption}</p>
    )}
  </div>
);

const SpotifyView = ({
  embedUrl,
  type,
  caption,
  originalUrl,
}: {
  embedUrl: string;
  type: "track" | "playlist";
  caption?: string;
  originalUrl: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex flex-col gap-1">
        <p className="font-body text-[11px] text-muted-foreground">
          This track couldn't be embedded.{" "}
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Open in Spotify →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <iframe
        src={embedUrl}
        height={type === "track" ? 80 : 152}
        className="w-full"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify embed"
        onError={() => setFailed(true)}
      />
      {caption && (
        <p className="font-body text-[10px] text-muted-foreground">{caption}</p>
      )}
    </div>
  );
};

const QuoteView = ({ quote, attribution }: { quote: string; attribution?: string }) => (
  <div className="flex flex-col items-center justify-center text-center h-full gap-2">
    <p className="font-display text-[22px] text-foreground leading-relaxed font-light">
      {quote}
    </p>
    {attribution && (
      <p className="font-body text-[11px] text-muted-foreground">
        — {attribution}
      </p>
    )}
  </div>
);

/* ── Main widget ── */
const StickyNoteWidget = ({ widgetId, config }: Props) => {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(config);

  const initialized = !!currentConfig?.initialized;
  const stickyMode = currentConfig?.stickyMode as StickyMode | undefined;

  const handleSave = async (cfg: Record<string, any>) => {
    setCurrentConfig(cfg);
    setEditing(false);
    await supabase
      .from("dashboard_widgets")
      .update({ config: cfg })
      .eq("id", widgetId);
  };

  const handleRemove = async () => {
    await supabase.from("dashboard_widgets").delete().eq("id", widgetId);
    // Widget will disappear on next render cycle from parent
  };

  // Not initialized → open modal immediately
  if (!initialized) {
    return (
      <StickyModal
        open={true}
        onOpenChange={() => {}}
        initial={null}
        onSave={handleSave}
      />
    );
  }

  return (
    <div
      className="h-full flex flex-col p-3 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmRemove(false); }}
    >
      {/* Hover actions */}
      {hovered && !confirmRemove && (
        <div className="absolute top-2 right-2 flex gap-2 animate-in fade-in duration-150 z-10">
          <button
            onClick={() => setEditing(true)}
            className="font-body text-[9px] text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            edit
          </button>
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
            Remove this note?
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {stickyMode === "text" && <TextView text={currentConfig.text || ""} />}
        {stickyMode === "youtube" && currentConfig.ytVideoId && (
          <YoutubeView
            videoId={currentConfig.ytVideoId}
            caption={currentConfig.ytCaption}
          />
        )}
        {stickyMode === "spotify" && currentConfig.spEmbedUrl && (
          <SpotifyView
            embedUrl={currentConfig.spEmbedUrl}
            type={currentConfig.spType || "track"}
            caption={currentConfig.spCaption}
            originalUrl={currentConfig.spUrl || ""}
          />
        )}
        {stickyMode === "quote" && (
          <QuoteView
            quote={currentConfig.quote || ""}
            attribution={currentConfig.attribution}
          />
        )}
      </div>

      {/* Edit modal */}
      <StickyModal
        open={editing}
        onOpenChange={setEditing}
        initial={currentConfig}
        onSave={handleSave}
      />
    </div>
  );
};

export default StickyNoteWidget;
