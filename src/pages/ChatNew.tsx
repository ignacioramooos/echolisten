import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoLogo } from "@/components/echo/EchoLogo";

const NewSession = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const maxChars = 500;

  const handleSubmit = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const snippet = message.trim().slice(0, 100);

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        seeker_id: user.id,
        status: "waiting" as const,
        topic_snippet: snippet,
      })
      .select()
      .single();

    if (sessionError || !session) {
      setError(sessionError?.message || "Failed to create session");
      setLoading(false);
      return;
    }

    // Navigate to chat room — first message will be sent once a listener joins
    // Store the opening message in sessionStorage for now
    sessionStorage.setItem(`echo-opening-${session.id}`, message.trim());
    navigate(`/chat/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <EchoLogo />
      </header>

      <div className="flex-1 flex items-center justify-center px-2">
        <div className="w-full max-w-echo">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) setMessage(e.target.value);
              }}
              placeholder="What's on your mind? Start here — your first message will match you with a Listener."
              className="w-full border border-foreground bg-background px-2 py-2 font-body text-[14px] text-foreground placeholder:text-muted-foreground placeholder:italic outline-none resize-none"
              rows={6}
            />
            <span className="absolute bottom-1 right-1 font-body text-[11px] text-muted-foreground">
              {message.length}/{maxChars}
            </span>
          </div>

          {error && (
            <p className="font-body text-[11px] text-foreground mt-1">⚠ {error}</p>
          )}

          <div className="mt-2">
            <EchoButton
              variant="solid"
              size="md"
              onClick={handleSubmit}
              disabled={!message.trim() || loading}
              className={!message.trim() || loading ? "opacity-40 cursor-not-allowed" : ""}
            >
              {loading ? "Finding..." : "Find a Listener"}
            </EchoButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSession;
