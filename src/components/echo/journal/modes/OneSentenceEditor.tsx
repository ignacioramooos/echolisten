interface OneSentenceEditorProps {
  value: string;
  onChange: (v: string) => void;
}

const OneSentenceEditor = ({ value, onChange }: OneSentenceEditorProps) => (
  <div className="flex flex-col gap-2 min-h-[100px] justify-center">
    <input
      value={value}
      onChange={(e) => {
        if (e.target.value.length <= 160) onChange(e.target.value);
      }}
      placeholder="Say the one true thing."
      maxLength={160}
      className="w-full bg-transparent font-body text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none border-b border-muted pb-2"
    />
    <p className="font-body text-[10px] text-muted-foreground text-right">
      {value.length}/160
    </p>
  </div>
);

export { OneSentenceEditor };
