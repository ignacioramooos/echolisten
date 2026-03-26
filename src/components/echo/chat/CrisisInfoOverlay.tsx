import { X } from "lucide-react";

interface CrisisInfoOverlayProps {
  onClose: () => void;
}

const CRISIS_LINES = [
  { country: "Uruguay", line: "0800 0767 (APEX)", hours: "24hs" },
  { country: "Argentina", line: "135 (Centro de Asistencia al Suicida)", hours: "24hs" },
  { country: "Chile", line: "600 360 7777", hours: "24hs" },
  { country: "Colombia", line: "106 (Línea de la Vida)", hours: "24hs" },
  { country: "España", line: "024", hours: "24hs" },
  { country: "México", line: "800 290 0024", hours: "24hs" },
  { country: "United States", line: "988 Suicide & Crisis Lifeline", hours: "24/7" },
  { country: "United Kingdom", line: "116 123 (Samaritans)", hours: "24/7" },
  { country: "Canada", line: "988", hours: "24/7" },
  { country: "Brasil", line: "188 (CVV)", hours: "24hs" },
  { country: "France", line: "3114", hours: "24/7" },
];

export const CrisisInfoOverlay = ({ onClose }: CrisisInfoOverlayProps) => (
  <div className="absolute inset-0 bg-background z-50 flex flex-col overflow-y-auto">
    <div className="border-b border-foreground px-3 py-1.5 flex items-center justify-between flex-shrink-0">
      <span className="font-body text-[11px] uppercase tracking-widest">
        Crisis Resources
      </span>
      <button onClick={onClose} className="text-foreground hover:opacity-70 echo-fade p-1">
        <X size={14} />
      </button>
    </div>
    <div className="px-3 py-3 max-w-echo mx-auto w-full">
      <p className="font-body text-[12px] text-muted-foreground mb-3">
        If the person you're speaking with is in crisis, share the relevant number below.
      </p>
      <div className="flex flex-col">
        {CRISIS_LINES.map((c) => (
          <div key={c.country} className="border-b border-foreground py-1.5 flex items-center justify-between">
            <span className="font-body text-[12px] text-foreground">{c.country}</span>
            <span className="font-body text-[11px] text-muted-foreground">{c.line} — {c.hours}</span>
          </div>
        ))}
      </div>
      <p className="font-body text-[11px] text-muted-foreground mt-3">
        Full directory:{" "}
        <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline">
          findahelpline.com
        </a>
      </p>
    </div>
  </div>
);
