interface FreeEditorProps {
  value: string;
  onChange: (v: string) => void;
}

const FreeEditor = ({ value, onChange }: FreeEditorProps) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Just write."
    className="w-full flex-1 resize-none bg-transparent font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none border-b border-muted pb-2 min-h-[200px]"
  />
);

export { FreeEditor };
