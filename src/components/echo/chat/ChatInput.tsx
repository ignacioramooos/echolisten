import { useRef, useCallback } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  sending: boolean;
  onSend: () => void;
}

export const ChatInput = ({ input, setInput, sending, onSend }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.substring(start, end);
    const newVal = input.substring(0, start) + prefix + selected + suffix + input.substring(end);
    setInput(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }, [input, setInput]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    const maxHeight = 8 * 24; // 8 rows
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  return (
    <div className="border-t border-foreground flex-shrink-0">
      {/* Rich text toolbar */}
      <div className="mx-auto w-full max-w-echo flex items-center gap-1 px-3 pt-2">
        <button
          onClick={() => insertFormat("**", "**")}
          className="p-1 text-muted-foreground hover:text-foreground echo-fade"
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => insertFormat("*", "*")}
          className="p-1 text-muted-foreground hover:text-foreground echo-fade"
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => insertFormat("__", "__")}
          className="p-1 text-muted-foreground hover:text-foreground echo-fade"
          title="Underline"
        >
          <Underline size={14} />
        </button>
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
          rows={2}
          className="flex-1 py-2 font-body text-[13px] leading-relaxed tracking-wide text-foreground bg-background outline-none resize-none placeholder:text-muted-foreground"
        />
        <EchoButton
          variant="solid"
          size="sm"
          onClick={onSend}
          disabled={sending || !input.trim()}
          className={`flex-shrink-0 ml-2 mb-1 ${sending || !input.trim() ? "opacity-40" : ""}`}
        >
          Send
        </EchoButton>
      </div>
    </div>
  );
};
