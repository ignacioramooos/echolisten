import { type PatternPhase, usePrefersReducedMotion } from "./usePattern";

interface BreatheCircleProps {
  phase: PatternPhase;
  phaseRemaining: number;
  running: boolean;
  size?: "compact" | "full";
}

const BreatheCircle = ({ phase, phaseRemaining, running, size = "full" }: BreatheCircleProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const dimensions = size === "compact" ? "h-24 w-24" : "h-56 w-56 sm:h-72 sm:w-72";

  return (
    <div className={`${dimensions} relative flex items-center justify-center`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-foreground"
        style={{
          transform: reducedMotion || !running ? "scale(0.84)" : `scale(${phase.scale})`,
          transition: reducedMotion ? "none" : `transform ${phase.seconds * 1000}ms linear`,
        }}
      />
      <div className="relative z-10 text-center">
        <p className="font-display italic text-[26px] sm:text-[34px] leading-none text-foreground">
          {phase.label}
        </p>
        {reducedMotion && running && (
          <p className="font-body text-[11px] text-muted-foreground mt-2">{phaseRemaining}</p>
        )}
      </div>
    </div>
  );
};

export default BreatheCircle;

