import { EMOTION_TAGS } from "../journalData";

interface UnspeakableEditorProps {
  value: string;
  onChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const UnspeakableEditor = ({ value, onChange, tags, onTagsChange }: UnspeakableEditorProps) => {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-[200px]">
      <p className="font-display italic text-[15px] text-muted-foreground">
        I can't explain it yet.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full flex-1 resize-none bg-transparent font-body text-[13px] text-foreground focus:outline-none border-b border-muted pb-2 min-h-[140px]"
      />
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`font-body text-[11px] px-3 py-1 border transition-colors duration-150 ${
              tags.includes(tag)
                ? "border-foreground bg-foreground text-background"
                : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export { UnspeakableEditor };
