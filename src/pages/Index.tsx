import { useNavigate, Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-2">
      <h1 className="font-display text-[72px] leading-none text-foreground text-center md:text-[80px]">
        Someone will listen.
      </h1>
      <p className="mt-2 font-body text-[14px] text-muted-foreground text-center max-w-[480px]">
        Echo connects you with trained peer listeners — anonymously, for free.
      </p>
      <div className="mt-4 flex gap-1">
        <EchoButton variant="solid" size="md" onClick={() => navigate("/chat/new")}>Find a Listener</EchoButton>
        <EchoButton variant="outline" size="md" onClick={() => navigate("/listener-signup")}>Become a Listener</EchoButton>
      </div>
    </section>
  );
};

const steps = [
  { num: "01", heading: "Write what's on your mind.", desc: "Share as much or as little as you need. No forms, no intake." },
  { num: "02", heading: "Get matched with a trained Listener.", desc: "Echo pairs you based on availability and training level." },
  { num: "03", heading: "Talk. No advice. Just presence.", desc: "Your Listener is there to hear you — nothing more, nothing less." },
];

const HowItWorksSection = () => (
  <section className="py-6">
    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
      For Seekers
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className={`py-2 md:py-0 md:px-2 ${
            i > 0 ? "border-t md:border-t-0 md:border-l border-foreground" : ""
          } ${i === 0 ? "md:pl-0" : ""}`}
        >
          <span className="font-body text-[12px] text-muted-foreground">{step.num}</span>
          <h3 className="font-display text-[24px] leading-tight mt-0.5">{step.heading}</h3>
          <p className="font-body text-[12px] text-muted-foreground mt-0.5">{step.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const formationSteps = [
  { num: "1", label: "Foundations" },
  { num: "2", label: "Techniques" },
  { num: "3", label: "Crisis Protocol" },
  { num: "4", label: "Bot Simulation ●", gate: true },
];

const FormationSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-6 border-t border-foreground">
      <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        For Listeners
      </p>
      <h2 className="font-display text-[36px] leading-tight">Not everyone becomes a Listener.</h2>
      <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
        Echo Listeners complete a rigorous training called The Formation — a multi-step program
        including readings, quizzes, and a live simulation with an AI test conversation.
      </p>

      <div className="mt-4 flex flex-col md:flex-row items-stretch">
        {formationSteps.map((step, i) => (
          <div key={step.num} className="flex items-center">
            {i > 0 && <div className="hidden md:block w-3 h-px bg-foreground" />}
            {i > 0 && <div className="block md:hidden h-2 w-px bg-foreground mx-auto" />}
            <div
              className={`border border-foreground px-2 py-1 font-body text-[12px] text-foreground whitespace-nowrap ${
                step.gate ? "font-medium" : ""
              }`}
            >
              {step.num}. {step.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <EchoButton variant="outline" size="md" onClick={() => navigate("/listener-signup")}>
          Begin Formation
        </EchoButton>
      </div>
    </section>
  );
};

const trustItems = [
  "Not a crisis line. For emergencies, call your local services.",
  "Not therapy. Listeners are trained volunteers, not clinicians.",
  "Not a social network. Sessions are private and do not persist.",
];

const TrustSection = () => (
  <section id="safety" className="py-6 border-t border-foreground">
    <h2 className="font-display text-[36px] leading-tight">What Echo is not.</h2>
    <ul className="mt-2 flex flex-col gap-1">
      {trustItems.map((item) => (
        <li key={item} className="font-body text-[13px] text-foreground">
          — {item}
        </li>
      ))}
    </ul>
  </section>
);

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-10 border-b border-foreground bg-background">
        <div className="mx-auto flex w-full max-w-echo items-center justify-between px-2 py-1">
          <Link to="/" className="font-display italic text-[24px] text-foreground select-none no-underline">
            <span className="mr-0.5">●</span> Echo
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/about" className="font-body text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline">
              About
            </Link>
            <Link to="/login" className="font-body text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline">
              Log In
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="echo-fade outline-none" aria-label="More options">
                  <MoreVertical size={18} strokeWidth={1.5} className="text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-foreground bg-background rounded-none min-w-[180px]">
                <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
                  <a href="#safety">Safety &amp; Disclaimers</a>
                </DropdownMenuItem>
                <DropdownMenuItem className="font-body text-[12px] text-muted-foreground cursor-default rounded-none">
                  Privacy (coming soon)
                </DropdownMenuItem>
                <DropdownMenuItem className="font-body text-[12px] text-muted-foreground cursor-default rounded-none">
                  Terms (coming soon)
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
                  <Link to="/about">Contact</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto w-full max-w-echo px-2">
        <HeroSection />
      </div>

      <div className="w-full border-t border-foreground" />

      {/* Content */}
      <div className="mx-auto w-full max-w-echo px-2">
        <HowItWorksSection />
        <FormationSection />
        <TrustSection />
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-foreground">
        <div className="mx-auto w-full max-w-echo flex items-center justify-between px-2 py-1">
          <p className="font-body text-[11px] text-muted-foreground">
            ● Echo — Peer support. No noise.
          </p>
          <nav className="flex gap-2">
            <Link to="/about" className="font-body text-[11px] text-foreground echo-fade no-underline">About</Link>
            <Link to="/about#safety" className="font-body text-[11px] text-foreground echo-fade no-underline">Safety</Link>
            <Link to="/formation" className="font-body text-[11px] text-foreground echo-fade no-underline">Become a Listener</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
