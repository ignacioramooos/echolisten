import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formationSteps } from "@/components/echo/formation/formationData";
import { StepContent } from "@/components/echo/formation/StepContent";
import { Simulation } from "@/components/echo/formation/Simulation";
import { FormationResult } from "@/components/echo/formation/FormationResult";
import { EchoLogo } from "@/components/echo/EchoLogo";
import type { EvalResult } from "@/lib/ai-client";

type StepId = "step-1" | "step-2" | "step-3" | "step-4";

const allStepIds: StepId[] = ["step-1", "step-2", "step-3", "step-4"];
const stepLabels: Record<StepId, string> = {
  "step-1": "Foundations",
  "step-2": "Crisis Signals",
  "step-3": "Boundaries & Tone",
  "step-4": "The Simulation",
};

const Formation = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<StepId>("step-1");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [botPassed, setBotPassed] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [simulationKey, setSimulationKey] = useState(0);

  // Load user and progress
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("formation_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setCompletedSteps(new Set(data.steps_completed || []));
        setBotPassed(data.bot_passed || false);
        if (data.bot_passed) {
          setActiveStep("step-4");
        }
      }
    };
    loadProgress();
  }, [navigate]);

  const saveProgress = useCallback(
    async (steps: Set<string>, passed: boolean) => {
      if (!userId) return;
      const stepsArray = Array.from(steps);

      const { data: existing } = await supabase
        .from("formation_progress")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("formation_progress")
          .update({
            steps_completed: stepsArray,
            bot_passed: passed,
            badge_earned_at: passed ? new Date().toISOString() : null,
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("formation_progress").insert({
          user_id: userId,
          steps_completed: stepsArray,
          bot_passed: passed,
          badge_earned_at: passed ? new Date().toISOString() : null,
        });
      }
    },
    [userId]
  );

  const handleStepComplete = (stepId: string) => {
    const next = new Set(completedSteps);
    next.add(stepId);
    setCompletedSteps(next);
    saveProgress(next, botPassed);

    // Auto-advance to next step
    const idx = allStepIds.indexOf(stepId as StepId);
    if (idx < allStepIds.length - 1) {
      setActiveStep(allStepIds[idx + 1]);
    }
  };

  const handleSimulationComplete = (result: EvalResult) => {
    setEvalResult(result);
    setShowResult(true);
    if (result.passed) {
      const next = new Set(completedSteps);
      next.add("step-4");
      setCompletedSteps(next);
      setBotPassed(true);
      saveProgress(next, true);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setEvalResult(null);
    setSimulationKey((k) => k + 1);
  };

  const step4Locked = !["step-1", "step-2", "step-3"].every((s) =>
    completedSteps.has(s)
  );

  const progressPercent =
    (completedSteps.size / 4) * 100;

  const getStepIcon = (stepId: StepId) => {
    if (completedSteps.has(stepId)) return "●";
    if (activeStep === stepId) return "◉";
    return "○";
  };

  // Full-screen result
  if (showResult && evalResult) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="border-b border-foreground px-2 py-1">
          <EchoLogo />
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <FormationResult result={evalResult} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top nav */}
      <div className="border-b border-foreground px-2 py-1 flex items-center justify-between">
        <EchoLogo />
        <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
          The Formation
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-secondary relative">
        <div
          className="h-px bg-foreground"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className="border-r border-foreground flex-shrink-0 py-3 px-2 flex flex-col gap-1"
          style={{ width: 200 }}
        >
          {allStepIds.map((stepId) => {
            const isLocked = stepId === "step-4" && step4Locked;
            const isActive = activeStep === stepId;

            return (
              <button
                key={stepId}
                onClick={() => {
                  if (!isLocked) setActiveStep(stepId);
                }}
                disabled={isLocked}
                className={`text-left px-1 py-0.5 font-body text-[12px] flex items-center gap-1 echo-fade ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                } ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className="text-[14px]">{isLocked ? "" : getStepIcon(stepId)}</span>
                {isLocked && <Lock size={12} strokeWidth={1.5} />}
                <span>{stepLabels[stepId]}</span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-3 overflow-y-auto">
          <div className="max-w-echo">
            {activeStep !== "step-4" ? (
              <StepContent
                key={activeStep}
                step={formationSteps[allStepIds.indexOf(activeStep)]}
                onComplete={() => handleStepComplete(activeStep)}
                completed={completedSteps.has(activeStep)}
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
