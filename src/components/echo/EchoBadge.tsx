interface EchoBadgeProps {
  label: string;
  variant?: "default" | "earned";
}

const EchoBadge = ({ label, variant = "default" }: EchoBadgeProps) => {
  const base = "inline-flex items-center font-body text-[11px] uppercase tracking-widest px-1 py-0.5";

  if (variant === "earned") {
    return (
      <span className={`${base} border border-foreground text-foreground`}>
        <span className="mr-0.5">●</span>
        {label}
      </span>
    );
  }

  return (
    <span className={`${base} bg-secondary text-foreground`}>
      {label}
    </span>
  );
};

export { EchoBadge };
