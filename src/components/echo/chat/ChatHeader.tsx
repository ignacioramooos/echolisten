import { Maximize2, Minimize2 } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";

interface ChatHeaderProps {
  isWaiting: boolean;
  isFocusMode: boolean;
  onToggleFocus: () => void;
  onEndSession: () => void;
}

export const ChatHeader = ({ isWaiting, isFocusMode, onToggleFocus, onEndSession }: ChatHeaderProps) => (
  <div className="bg-foreground text-background px-3 py-1.5 flex items-center justify-between flex-shrink-0">
    <span className="font-display italic text-[16px]">
      ● Echo — {isWaiting ? "Waiting" : "Active Session"}
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleFocus}
        className="text-background hover:opacity-70 echo-fade p-1"
        title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
      >
        {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      {!isWaiting && (
        <EchoButton
          variant="outline"
          size="sm"
          onClick={onEndSession}
          className="border-background text-background hover:bg-background hover:text-foreground"
        >
          End Session
        </EchoButton>
      )}
    </div>
  </div>
);
