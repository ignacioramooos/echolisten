import { useRef, useCallback } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  sending: boolean;
  onSend: () => void;
  isFocusMode?: boolean;
}

const MAX_CHARS = 1000;

export const ChatInput = ({ input, setInput, sending, onSend, isFocusMode }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.substring(start, end);
    const newVal = input.substring(0, start) + prefix + selected + suffix + input.substring(end);
    if (newVal.length <= MAX_CHARS) {
      setInput(newVal);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    }
  }, [input, setInput]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setInput(val);
    }
    const el = e.target;
    el.style.height = "auto";
    const maxHeight = 8 * 24;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const borderColor = isFocusMode ? "border-background/30" : "border-foreground";
  const textColor = isFocusMode ? "text-background" : "text-foreground";
  const mutedColor = isFocusMode ? "text-background/40" : "text-muted-foreground";
  const bgColor = isFocusMode ? "bg-transparent" : "bg-background";

  return (
    <div className={`border-t ${borderColor} flex-shrink-0`}>
      {/* Toolbar + char counter */}
      <div className="mx-auto w-full max-w-echo flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-1">
          {[
            { fn: () => insertFormat("**", "**"), icon: <Bold size={12} />, title: "Bold" },
            { fn: () => insertFormat("*", "*"), icon: <Italic size={12} />, title: "Italic" },
            { fn: () => insertFormat("__", "__"), icon: <Underline size={12} />, title: "Underline" },
          ].map((btn) => (
            <button
              key={btn.title}
              onClick={btn.fn}
              className={`p-1 border ${borderColor} ${mutedColor} hover:${textColor} echo-fade font-body text-[11px]`}
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>
        <span className={`font-body text-[10px] ${mutedColor}`}>
          {input.length} / {MAX_CHARS}
        </span>
      </div>

      <div className="mx-auto w-full max-w-echo flex items-end px-3 pb-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a message..."
          rows={3}
          className={`flex-1 py-2 font-body text-[13px] leading-relaxed tracking-wide ${textColor} ${bgColor} outline-none resize-none placeholder:${mutedColor}`}
        />
        <EchoButton
          variant="solid"
          size="sm"
          onClick={onSend}
          disabled={sending || !input.trim()}
          className={`flex-shrink-0 ml-2 mb-1 ${sending || !input.trim() ? "opacity-40" : ""} ${
            isFocusMode ? "border-background text-background hover:bg-background hover:text-foreground" : ""
          }`}
        >
          Send
        </EchoButton>
      </div>
    </div>
  );
};
