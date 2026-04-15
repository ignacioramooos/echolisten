import { useState, useRef, KeyboardEvent } from "react";

interface BulletEditorProps {
  value: string;
  onChange: (v: string) => void;
}

const BulletEditor = ({ value, onChange }: BulletEditorProps) => {
  const parseBullets = (v: string): string[] => {
    const items = v.split("\n").filter((_, i, arr) => i < arr.length || arr[i] !== "");
    return items.length === 0 ? [""] : items;
  };

  const [bullets, setBullets] = useState<string[]>(parseBullets(value));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateBullet = (idx: number, text: string) => {
    const next = [...bullets];
    next[idx] = text;
    setBullets(next);
    onChange(next.join("\n"));
  };

  const handleKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = [...bullets];
      next.splice(idx + 1, 0, "");
      setBullets(next);
      onChange(next.join("\n"));
      setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0);
    }
    if (e.key === "Backspace" && bullets[idx] === "" && bullets.length > 1) {
      e.preventDefault();
      const next = bullets.filter((_, i) => i !== idx);
      setBullets(next);
      onChange(next.join("\n"));
      setTimeout(() => inputRefs.current[Math.max(0, idx - 1)]?.focus(), 0);
    }
  };

  return (
    <div className="flex flex-col gap-1 min-h-[200px]">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="font-body text-[12px] text-muted-foreground select-none">·</span>
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            value={b}
            onChange={(e) => updateBullet(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            placeholder={i === 0 ? "One thought." : ""}
            className="flex-1 bg-transparent font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none border-b border-muted pb-1"
          />
        </div>
      ))}
    </div>
  );
};

export { BulletEditor };
