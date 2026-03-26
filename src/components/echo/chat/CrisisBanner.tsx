import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CrisisBannerProps {
  collapsed?: boolean;
}

const CrisisBanner = ({ collapsed: initialCollapsed }: CrisisBannerProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);

  if (collapsed) {
    return (
      <div className="bg-foreground text-background px-2 py-0.5 flex items-center justify-between flex-shrink-0">
        <span className="font-body text-[11px]">⚠ Crisis resources available</span>
        <button onClick={() => setCollapsed(false)} className="echo-fade p-0.5">
          <ChevronDown size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-foreground text-background px-2 py-1.5 flex items-start justify-between gap-2 flex-shrink-0">
      <div>
        <p className="font-body text-[12px] leading-tight">
          If you or someone you know is in immediate danger, please contact emergency services or a
          crisis line.
        </p>
        <p className="font-body text-[11px] mt-0.5 opacity-80">
          Uruguay: 0800 0767 (APEX) — 24hs
        </p>
        <p className="font-body text-[11px] opacity-80">
          International:{" "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            findahelpline.com
          </a>
        </p>
      </div>
      <button onClick={() => setCollapsed(true)} className="flex-shrink-0 echo-fade mt-[2px]">
        <ChevronUp size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export { CrisisBanner };
