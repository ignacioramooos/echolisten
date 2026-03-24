import React from "react";

interface EchoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "solid";
  size?: "sm" | "md";
}

const EchoButton = React.forwardRef<HTMLButtonElement, EchoButtonProps>(
  ({ variant = "outline", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "font-body border border-foreground inline-flex items-center justify-center echo-fade cursor-pointer select-none";
    const sizeClass = size === "sm" ? "px-1 py-0.5 text-[12px]" : "px-2 py-1 text-[14px]";
    const variantClass =
      variant === "solid"
        ? "bg-foreground text-background hover:opacity-70"
        : "bg-background text-foreground hover:bg-foreground hover:text-background";

    return (
      <button
        ref={ref}
        className={`${base} ${sizeClass} ${variantClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

EchoButton.displayName = "EchoButton";
export { EchoButton };
