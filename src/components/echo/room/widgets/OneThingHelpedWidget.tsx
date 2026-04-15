import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const OneThingHelpedWidget = ({ widgetId, config }: Props) => {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedText, setSavedText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("memory_shelf").insert({
      user_id: user.id,
      content: text.trim(),
      label: "helped",
    } as any);

    setSavedText(text.trim());
    setText("");
    setSaved(true);
    setSaving(false);
  };

  const handleBack = () => {
    setSaved(false);
    setSavedText("");
  };

  if (saved) {
    return (
      <div className="h-full flex flex-col p-3 animate-in fade-in duration-150">
        <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider mb-3">
          One Thing That Helped
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p className="font-body text-[13px] text-foreground text-center leading-relaxed">
            {savedText}
          </p>
        </div>
        <button
          onClick={handleBack}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 self-start mt-2"
        >
          ← back
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
        One Thing That Helped
      </p>
      <p className="font-body text-[11px] text-muted-foreground mb-3">
        Today, one thing that helped — even a little:
      </p>
      <div className="flex-1 flex items-center">
        <input
          value={text}
          onChange={(e) => { if (e.target.value.length <= 120) setText(e.target.value); }}
          placeholder="…"
          className="w-full bg-transparent font-body text-[13px] text-foreground border-b border-muted focus:outline-none placeholder:text-muted-foreground pb-1"
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="font-body text-[9px] text-muted-foreground">{text.length}/120</p>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-30"
        >
          {saving ? "saving…" : "save it"}
        </button>
      </div>
    </div>
  );
};

export default OneThingHelpedWidget;
