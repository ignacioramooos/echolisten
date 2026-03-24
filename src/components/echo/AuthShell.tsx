import { ReactNode } from "react";
import { EchoLogo } from "@/components/echo/EchoLogo";

const AuthShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-background px-2">
    <div className="w-full border border-foreground bg-background" style={{ maxWidth: 400 }}>
      <div className="px-3 pt-3 pb-1">
        <EchoLogo />
      </div>
      <div className="border-t border-foreground" />
      <div className="px-3 py-3">
        {children}
      </div>
    </div>
  </div>
);

export { AuthShell };
