import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formationSteps, PASS_THRESHOLD, MAX_POINTS } from "@/components/echo/formation/formationContent";
import { StepContent } from "@/components/echo/formation/StepContent";
import { Simulation } from "@/components/echo/formation/Simulation";
import { FormationResult } from "@/components/echo/formation/FormationResult";
import type { EvalResult } from "@/lib/ai-client";

type View = "welcome" | "training" | "simulation-result" | "complete";

const STEP_IDS = [...formationSteps.map(s => s.id), "step-9"];
const STEP_LABELS: Record<string, string> = {
  "step-1": "1. Active Listening",
  "step-2": "2. Reflection",
  "step-3": "3. Labeling Emotions",
  "step-4": "4. Asking Questions",
  "step-5": "5. Empathy",
  "step-6": "6. Lived Experience",
  "step-7": "7. Identifying Strengths",
  "step-8": "8. Chat Protocol",
  "step-9": "9. The Simulation",
};

const Formation = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("welcome");
  const [activeStep, setActiveStep] = useState("step-1");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { attempts: number; points: number }>>({});
  const [botPassed, setBotPassed] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [simulationKey, setSimulationKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("formation_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setCompletedSteps(new Set(data.steps_completed || []));
        setBotPassed(data.bot_passed || false);
        setScore(data.score || 0);
        const qa = (data.quiz_answers as Record<string, { attempts: number; points: number }>) || {};
        setQuizAnswers(qa);

        if (data.badge_earned_at) {
          setView("complete");
        } else if (data.steps_completed?.length > 0) {
          setView("training");
        }
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const saveProgress = useCallback(
    async (steps: Set<string>, newScore: number, newAnswers: Record<string, any>, passed: boolean) => {
      if (!userId) return;
      const stepsArray = Array.from(steps);

      const { data: existing } = await supabase
        .from("formation_progress")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const payload = {
        steps_completed: stepsArray,
        bot_passed: passed,
        score: newScore,
        quiz_answers: newAnswers,
        badge_earned_at: passed ? new Date().toISOString() : null,
      };

      if (existing) {
        await supabase.from("formation_progress").update(payload).eq("user_id", userId);
      } else {
        await supabase.from("formation_progress").insert({ user_id: userId, ...payload });
      }
    },
    [userId]
  );

  const handleStepComplete = (stepId: string, pointsEarned: number, answers: Record<string, { attempts: number; points: number }>) => {
    const nextSteps = new Set(completedSteps);
    nextSteps.add(stepId);
    setCompletedSteps(nextSteps);

    const newAnswers = { ...quizAnswers, ...answers };
    setQuizAnswers(newAnswers);

    // Recalculate total score from all answers
    const newScore = Object.values(newAnswers).reduce((s, a) => s + (a.points || 0), 0);
    setScore(newScore);
    saveProgress(nextSteps, newScore, newAnswers, botPassed);

    // Auto-advance
    const idx = STEP_IDS.indexOf(stepId);
    if (idx < STEP_IDS.length - 1) {
      setActiveStep(STEP_IDS[idx + 1]);
    }
  };

  const handleSimulationComplete = (result: EvalResult) => {
    setEvalResult(result);
    if (result.passed) {
      const nextSteps = new Set(completedSteps);
      nextSteps.add("step-9");
      setCompletedSteps(nextSteps);
      setBotPassed(true);
      saveProgress(nextSteps, score, quizAnswers, true);
      setView("complete");
    } else {
      setView("simulation-result");
    }
  };

  const handleRetry = () => {
    setView("training");
    setEvalResult(null);
    setSimulationKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-body text-[14px] text-muted-foreground">●</span>
      </div>
    );
  }

  const step9Locked = !formationSteps.every(s => completedSteps.has(s.id)) || score < PASS_THRESHOLD;
  const progressPercent = (completedSteps.size / STEP_IDS.length) * 100;

  const getStepIcon = (stepId: string) => {
    if (completedSteps.has(stepId)) return "●";
    if (activeStep === stepId) return "◉";
    return "○";
  };

  // ─── WELCOME SCREEN ───
  if (view === "welcome") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="border-b border-foreground px-2 py-1">
          <Link to="/" className="font-display italic text-[24px] text-foreground select-none no-underline">
            <span className="mr-0.5">●</span> Cor ad Cor
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="max-w-[560px]">
            <h1 className="font-display text-[48px] leading-tight text-foreground">Welcome.</h1>
            <div className="mt-3 flex flex-col gap-2">
              <p className="font-body text-[13px] text-foreground leading-relaxed">
                There are many people with no one to talk to. As a Cor Ad Cor Listener, you will help create a safe space for people to share what's happening in their lives, anonymously and for free.
              </p>
              <p className="font-body text-[13px] text-foreground leading-relaxed">
                This formation takes approximately 60 minutes. Your progress is saved automatically.
              </p>
              <div className="border border-foreground p-2 mt-1">
                <p className="font-body text-[12px] text-foreground">
                  <strong>Scoring:</strong> There are 23 questions. You have 2 attempts per question. Correct on the 1st attempt: 2 pts. Correct on the 2nd: 1 pt. Wrong on both: 0 pts.
                </p>
                <p className="font-body text-[12px] text-foreground mt-0.5">
                  You need at least <strong>{PASS_THRESHOLD} of {MAX_POINTS} points</strong> to unlock the Simulation.
                </p>
              </div>
            </div>
            <button
              onClick={() => setView("training")}
              className="mt-4 border border-foreground bg-foreground text-background px-3 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
            >
              Begin Formation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SIMULATION RESULT (failed) ───
  if (view === "simulation-result" && evalResult) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="border-b border-foreground px-2 py-1">
          <Link to="/" className="font-display italic text-[24px] text-foreground select-none no-underline">
            <span className="mr-0.5">●</span> Cor ad Cor
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <FormationResult result={evalResult} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  // ─── COMPLETION SCREEN ───
  if (view === "complete") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-2">
        <h1 className="font-display text-[56px] leading-tight text-foreground text-center">You're a Listener.</h1>
        <div className="mt-3 border border-foreground px-4 py-2 text-center">
          <span className="font-display italic text-[24px] text-foreground">● Cor ad Cor</span>
          <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Certified Listener</p>
        </div>
        <p className="font-body text-[13px] text-muted-foreground mt-3">
          Quiz Score: {score} / {MAX_POINTS} pts
        </p>
        {evalResult && (
          <div className="mt-4 w-full max-w-[480px] flex flex-col gap-1">
            {Object.entries(evalResult.feedback).map(([key, value]) => (
              <div key={key} className="border border-foreground p-2">
                <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">{key.replace(/_/g, " ")}</p>
                <p className="font-body text-[13px] text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 border border-foreground bg-foreground text-background px-4 py-1 font-body text-[13px] uppercase tracking-widest echo-fade"
        >
          Go to Dashboard →
        </button>
      </div>
    );
  }

  // ─── TRAINING VIEW ───
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <Link to="/" className="font-display italic text-[24px] text-foreground select-none no-underline">
          <span className="mr-0.5">●</span> Cor ad Cor — Formation
        </Link>
        <span className="font-body text-[12px] text-foreground">
          {score} / {MAX_POINTS} pts
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-secondary relative">
        <div className="h-px bg-foreground transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="border-r border-foreground flex-shrink-0 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto" style={{ width: 220 }}>
          {STEP_IDS.map(stepId => {
            const isLocked = stepId === "step-9" && step9Locked;
            const isActive = activeStep === stepId;
            return (
              <button
                key={stepId}
                onClick={() => { if (!isLocked) setActiveStep(stepId); }}
                disabled={isLocked}
                className={`text-left px-1 py-0.5 font-body text-[12px] flex items-center gap-1 echo-fade ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                } ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isLocked ? <Lock size={12} strokeWidth={1.5} /> : (
                  <span className="text-[14px] w-2 text-center">{getStepIcon(stepId)}</span>
                )}
                <span>{STEP_LABELS[stepId]}</span>
              </button>
            );
          })}

          {/* Score threshold indicator */}
          <div className="mt-auto pt-3 border-t border-foreground">
            <p className="font-body text-[10px] text-muted-foreground">
              Simulation unlocks at {PASS_THRESHOLD} pts
            </p>
            <div className="w-full h-px bg-secondary mt-0.5 relative">
              <div
                className="h-px bg-foreground"
                style={{ width: `${Math.min(100, (score / PASS_THRESHOLD) * 100)}%` }}
              />
            </div>
            <p className="font-body text-[10px] text-foreground mt-0.5">
              {score} / {PASS_THRESHOLD}
              {score >= PASS_THRESHOLD && " ✓"}
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-3 overflow-y-auto">
          <div className="max-w-echo">
            {activeStep !== "step-9" ? (
              <StepContent
                key={activeStep}
                step={formationSteps.find(s => s.id === activeStep)!}
                onComplete={(pts, answers) => handleStepComplete(activeStep, pts, answers)}
                completed={completedSteps.has(activeStep)}
                savedAnswers={quizAnswers}
              />
            ) : (
              <Simulation
                key={simulationKey}
                onComplete={handleSimulationComplete}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Formation;
