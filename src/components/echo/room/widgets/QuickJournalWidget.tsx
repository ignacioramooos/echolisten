import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  widgetId: string;
  config: Record<string, any>;
}

const QuickJournalWidget = ({ widgetId, config }: Props) => {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!text.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("journal_entries").insert({
      user_id: user.id,
      mode: "free" as any,
      content: text,
    } as any);

    setText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-3">
      <p className="font-body text-[10px] text-muted-foreground mb-2">Quick Journal</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something. Anything."
        className="flex-1 resize-none bg-transparent font-body text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex items-center justify-between mt-2">
        {saved && <p className="font-body text-[10px] text-muted-foreground">Saved ✓</p>}
        <button
          onClick={save}
          disabled={!text.trim()}
          className="font-body text-[11px] border border-foreground px-3 py-1 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 disabled:opacity-30 ml-auto"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default QuickJournalWidget;
