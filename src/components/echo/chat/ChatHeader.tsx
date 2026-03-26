import { Maximize2, Minimize2, Search, Ban, Flag, X } from "lucide-react";
import { useState } from "react";
import { EchoButton } from "@/components/echo/EchoButton";

interface ChatHeaderProps {
  isWaiting: boolean;
  isFocusMode: boolean;
  isListener: boolean;
  onToggleFocus: () => void;
  onEndSession: () => void;
  onShowCrisisInfo: () => void;
  onBlockUser: () => void;
  onFlagSession: (reason: string) => void;
}

const FLAG_REASONS = [
  "Inappropriate content",
  "Suspected minor",
  "Feels unsafe",
  "Other",
];

export const ChatHeader = ({
  isWaiting,
  isFocusMode,
  isListener,
  onToggleFocus,
  onEndSession,
  onShowCrisisInfo,
  onBlockUser,
  onFlagSession,
}: ChatHeaderProps) => {
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  return (
    <div className="bg-foreground text-background px-3 py-1.5 flex items-center justify-between flex-shrink-0 relative">
      <span className="font-display italic text-[16px]">
        ● Echo — {isWaiting ? "Waiting" : "Active Session"}
      </span>
      <div className="flex items-center gap-1">
        {isListener && !isWaiting && (
          <>
            {/* Crisis info */}
            <button
              onClick={onShowCrisisInfo}
              className="text-background hover:opacity-70 echo-fade p-1 border border-background/30"
              title="Crisis Resources"
            >
              <Search size={14} />
            </button>

            {/* Block user */}
            <button
              onClick={() => setShowBlockConfirm(true)}
              className="text-background hover:opacity-70 echo-fade p-1 border border-background/30"
              title="Block User"
            >
              <Ban size={14} />
            </button>

            {/* Flag session */}
            <button
              onClick={() => setShowFlagMenu(!showFlagMenu)}
              className="text-background hover:opacity-70 echo-fade p-1 border border-background/30"
              title="Flag Session"
            >
              <Flag size={14} />
            </button>
          </>
        )}

        <button
          onClick={onToggleFocus}
          className="text-background hover:opacity-70 echo-fade p-1 border border-background/30"
          title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
        >
          {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {!isWaiting && (
          <button
            onClick={onEndSession}
            className="text-background hover:opacity-70 echo-fade p-1 border border-background/30"
            title="End Session"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Flag dropdown */}
      {showFlagMenu && (
        <div className="absolute top-full right-0 mt-0 bg-background text-foreground border border-foreground z-50 w-[220px]">
          <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground px-2 pt-2 pb-1">
            Flag Reason
          </p>
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => {
                onFlagSession(reason);
                setShowFlagMenu(false);
              }}
              className="block w-full text-left font-body text-[12px] px-2 py-1.5 hover:bg-foreground hover:text-background echo-fade"
            >
              {reason}
            </button>
          ))}
        </div>
      )}

      {/* Block confirm overlay */}
      {showBlockConfirm && (
        <div className="absolute top-full right-0 mt-0 bg-background text-foreground border border-foreground z-50 w-[280px] p-3">
          <p className="font-body text-[12px]">
            Block this user? This will flag the session for admin review.
          </p>
          <div className="flex gap-1 mt-2">
            <EchoButton
              variant="solid"
              size="sm"
              onClick={() => {
                onBlockUser();
                setShowBlockConfirm(false);
              }}
            >
              Confirm Block
            </EchoButton>
            <EchoButton
              variant="outline"
              size="sm"
              onClick={() => setShowBlockConfirm(false)}
            >
              Cancel
            </EchoButton>
          </div>
        </div>
      )}
    </div>
  );
};
