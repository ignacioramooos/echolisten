import { X } from "lucide-react";

interface CrisisBannerProps {
  onDismiss: () => void;
}

const CrisisBanner = ({ onDismiss }: CrisisBannerProps) => (
  <div className="bg-foreground text-background px-2 py-1 flex items-start justify-between gap-2">
    <div>
      <p className="font-body text-[12px] leading-tight">
        If you or someone you know is in immediate danger, please contact emergency services or a
        crisis line.
      </p>
      <p className="font-body text-[11px] mt-0.5 opacity-80">
        Uruguay: 0800 0767 (APEX) | International:{" "}
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
    <button onClick={onDismiss} className="flex-shrink-0 echo-fade mt-[2px]">
      <X size={14} strokeWidth={1.5} />
    </button>
  </div>
);

export { CrisisBanner };
