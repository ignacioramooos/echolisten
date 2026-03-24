import React from "react";

interface EchoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const EchoInput = React.forwardRef<HTMLInputElement, EchoInputProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label htmlFor={inputId} className="font-body text-[12px] uppercase tracking-widest text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full border border-foreground bg-background px-1 py-1 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 ${
            error ? "border-foreground" : ""
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <span className="font-body text-[11px] text-muted-foreground">{hint}</span>
        )}
        {error && (
          <span className="font-body text-[11px] text-foreground">⚠ {error}</span>
        )}
      </div>
    );
  }
);

EchoInput.displayName = "EchoInput";
export { EchoInput };
