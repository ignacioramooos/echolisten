import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoLogo } from "@/components/echo/EchoLogo";

interface SessionEndScreenProps {
  isSeeker: boolean;
  sessionId: string;
  userId: string;
}

const SessionEndScreen = ({ isSeeker, sessionId, userId }: SessionEndScreenProps) => {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = async () => {
    if (rating > 0) {
      await supabase.from("session_ratings").insert({
        session_id: sessionId,
        user_id: userId,
        rating,
        feedback: feedback.trim() || null,
      });
    }
    setSubmitted(true);
  };

  if (isSeeker) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-foreground px-2 py-1">
          <EchoLogo />
        </header>
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="w-full max-w-[400px] text-center">
            <h1 className="font-display text-[36px] leading-tight">Session ended.</h1>

            {!submitted ? (
              <div className="mt-4">
                {/* 5-dot rating */}
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className="font-body text-[24px] echo-fade cursor-pointer"
                    >
                      {n <= rating ? "●" : "○"}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <p className="font-body text-[12px] text-muted-foreground mb-0.5">
                    How did this feel?
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) setFeedback(e.target.value);
                    }}
                    placeholder="Optional — 200 characters"
                    className="w-full border border-foreground bg-background px-1 py-1 font-body text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="mt-2">
                  <EchoButton variant="solid" size="md" onClick={handleSubmitRating}>
                    Done
                  </EchoButton>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="font-body text-[13px] text-muted-foreground">
                  Thank you for sharing.
                </p>
                <div className="mt-2">
                  <EchoButton variant="outline" size="md" onClick={() => navigate("/")}>
                    Back to Echo
                  </EchoButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Listener end screen
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground px-2 py-1">
        <EchoLogo />
      </header>
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="w-full max-w-[400px] text-center">
          <h1 className="font-display text-[36px] leading-tight">Session ended.</h1>
          <p className="font-body text-[13px] text-muted-foreground mt-2">
            Thank you for listening. Take a moment for yourself.
          </p>
          <div className="mt-4 flex justify-center gap-1">
            <EchoButton variant="outline" size="md" onClick={() => navigate("/listen")}>
              Back to Queue
            </EchoButton>
            <EchoButton
              variant="outline"
              size="md"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Log Out
            </EchoButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SessionEndScreen };
