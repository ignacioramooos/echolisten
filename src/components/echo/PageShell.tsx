import { ReactNode } from "react";
import { EchoLogo } from "./EchoLogo";

interface PageShellProps {
  children: ReactNode;
  navLinks?: { label: string; href: string }[];
}

const PageShell = ({ children, navLinks = [] }: PageShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-foreground">
        <div className="mx-auto flex w-full max-w-echo items-center justify-between px-2 py-1">
          <EchoLogo />
          {navLinks.length > 0 && (
            <nav className="flex gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-body text-[12px] uppercase tracking-widest text-foreground echo-fade"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-echo flex-1 flex-col px-2 py-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1">
          <p className="font-body text-[11px] text-muted-foreground">
            Echo — Peer support. No noise.
          </p>
        </div>
      </footer>
    </div>
  );
};

export { PageShell };
