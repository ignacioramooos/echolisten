import { EchoButton } from "@/components/echo/EchoButton";
import type { EvalResult } from "@/lib/ai-client";

interface FormationResultProps {
  result: EvalResult;
  onRetry: () => void;
}

const FormationResult = ({ result, onRetry }: FormationResultProps) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="font-display text-[48px] leading-none text-foreground text-center">
        {result.passed ? "You're a Listener." : "Not yet."}
      </h1>

      {result.passed && (
        <div className="mt-3 border border-foreground px-3 py-2 text-center">
          <span className="font-display italic text-[24px] text-foreground">● Echo</span>
          <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">
            Certified Listener
          </p>
        </div>
      )}

      <p className="font-body text-[14px] text-muted-foreground mt-3">
        Simulation Score: {result.score}/100
      </p>

      <div className="mt-4 w-full max-w-[480px] flex flex-col gap-2">
        {Object.entries(result.feedback).map(([key, value]) => (
          <div key={key} className="border border-foreground p-2">
            <p className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
              {key.replace(/_/g, " ")}
            </p>
            <p className="font-body text-[13px] text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {!result.passed && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="font-body text-[12px] text-muted-foreground">
            You need 60/100 to pass. Review the material and try again.
          </p>
          <EchoButton variant="outline" size="md" onClick={onRetry}>
            Retry Simulation
          </EchoButton>
        </div>
      )}
    </div>
  );
};

export { FormationResult };
