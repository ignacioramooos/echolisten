import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MoreVertical } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Hero ── */
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center px-2 py-10 md:py-20 text-center">
      <h1 className="font-display italic text-[40px] sm:text-[56px] md:text-[72px] leading-[1.05] text-foreground max-w-[680px] break-words">
        A space to write what you carry.
      </h1>
      <p className="mt-4 font-body text-[12px] sm:text-[13px] text-muted-foreground max-w-[520px] leading-relaxed px-2">
        Cor Ad Cor helps you process difficult moments through writing, reflection,
        and real human listening — privately and at your own pace.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto px-2 sm:px-0">
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/seeker")} className="w-full sm:w-auto">
          Enter Cor Ad Cor
        </EchoButton>
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/listener")} className="w-full sm:w-auto">
          Become a Listener
        </EchoButton>
      </div>

      <p className="mt-4 font-body text-[11px] text-muted-foreground tracking-wider">
        Anonymous. Free. Human.
      </p>
      <p className="mt-6 font-display italic text-[14px] sm:text-[15px] text-muted-foreground">
        Some come to be heard. Others come to listen.
      </p>
    </section>
  );
};

/* ── Dual Role ── */
const DualRoleSection = () => (
  <section className="py-10 md:py-16 border-t border-muted">
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="pr-0 md:pr-8 pb-8 md:pb-0 md:border-r border-muted">
        <h2 className="font-display italic text-[24px] sm:text-[28px] text-foreground mb-4">
          You need to talk
        </h2>
        <ul className="flex flex-col gap-2">
          {[
            "Write freely or just one sentence",
            "Use guided prompts if you don't know what to say",
            "Share only if you want",
            "Someone can be there",
          ].map((line) => (
            <li key={line} className="font-body text-[12px] text-muted-foreground">
              — {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="pl-0 md:pl-8 pt-8 md:pt-0 border-t md:border-t-0 border-muted">
        <h2 className="font-display italic text-[24px] sm:text-[28px] text-foreground mb-4">
          You want to listen
        </h2>
        <ul className="flex flex-col gap-2">
          {[
            "Be present for someone else",
            "No pressure to fix anything",
            "Just listen and respond as a human",
            "Make a real difference",
          ].map((line) => (
            <li key={line} className="font-body text-[12px] text-muted-foreground">
              — {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

/* ── Three Pillars ── */
const PillarsSection = () => {
  const pillars = [
    { title: "Write", desc: "Put your thoughts somewhere real." },
    { title: "Reflect", desc: "Understand what you feel over time." },
    { title: "Connect", desc: "Talk to someone when writing is not enough." },
  ];

  return (
    <section className="py-10 md:py-16 border-t border-muted">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className={`py-4 md:py-0 md:px-6 ${
              i > 0 ? "border-t md:border-t-0 md:border-l border-muted" : ""
            } ${i === 0 ? "md:pl-0" : ""}`}
          >
            <h3 className="font-display italic text-[22px] sm:text-[24px] text-foreground">
              {p.title}
            </h3>
            <p className="font-body text-[12px] text-muted-foreground mt-2">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
      <p className="font-body text-[11px] text-muted-foreground mt-6 md:mt-8">
        Connection is not an add-on. It is the core.
      </p>
    </section>
  );
};

/* ── How It Works ── */
const HowItWorksSection = () => {
  const steps = [
    { num: "01", text: "Write or check in" },
    { num: "02", text: "Organize what you feel" },
    { num: "03", text: "Choose to share — or not" },
    { num: "04", text: "Connect with a listener" },
  ];

  return (
    <section className="py-10 md:py-16 border-t border-muted">
      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4 md:mb-6">
        How it works
      </p>
      <div className="flex flex-col gap-3 md:gap-4">
        {steps.map((s) => (
          <div key={s.num} className="flex items-baseline gap-3 md:gap-4">
            <span className="font-body text-[11px] text-muted-foreground w-[24px] shrink-0">
              {s.num}
            </span>
            <p className="font-display text-[18px] sm:text-[20px] text-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Personal Space Preview ── */
const PersonalSpaceSection = () => (
  <section className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">
      Your personal space
    </p>
    <h2 className="font-display italic text-[24px] sm:text-[28px] text-foreground mb-4 md:mb-6">
      More than a chat.
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px border border-muted">
      {[
        { label: "Journal", sub: "Write freely, guided, or just one sentence" },
        { label: "Mood", sub: "Track how you feel over time" },
        { label: "Room", sub: "A personal dashboard — notes, music, counters" },
        { label: "Shelf", sub: "Save the lines that matter" },
      ].map((item) => (
        <div key={item.label} className="p-3 md:p-4 border border-muted">
          <p className="font-body text-[12px] text-foreground mb-1">{item.label}</p>
          <p className="font-body text-[10px] text-muted-foreground leading-snug">
            {item.sub}
          </p>
        </div>
      ))}
    </div>
  </section>
);

/* ── Peer Support Core ── */
const PeerSupportSection = () => (
  <section className="py-10 md:py-16 border-t border-muted">
    <h2 className="font-display italic text-[24px] sm:text-[28px] text-foreground mb-4 md:mb-6">
      Real people. Not algorithms.
    </h2>
    <div className="flex flex-col gap-3 max-w-[480px]">
      <p className="font-body text-[12px] text-muted-foreground">
        — No judgment. No pressure.
      </p>
      <p className="font-body text-[12px] text-muted-foreground">
        — You don't need the right words.
      </p>
    </div>
    <div className="mt-6 md:mt-8 border-t border-muted pt-4 md:pt-6 max-w-[480px]">
      <p className="font-display italic text-[15px] sm:text-[16px] text-foreground leading-relaxed">
        For some, this is a place to be heard.
      </p>
      <p className="font-display italic text-[15px] sm:text-[16px] text-foreground leading-relaxed">
        For others, it's a place to be there.
      </p>
    </div>
  </section>
);

/* ── Values / Safety ── */
const ValuesSection = () => (
  <section id="safety" className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4 md:mb-6">
      How we think about this
    </p>
    <div className="flex flex-col gap-3 md:gap-4 max-w-[480px]">
      {[
        "You don't have to explain everything perfectly.",
        "You can take your time.",
        "You decide what to share.",
      ].map((line) => (
        <p key={line} className="font-body text-[13px] text-foreground">
          {line}
        </p>
      ))}
    </div>
  </section>
);

/* ── Final CTA ── */
const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-10 md:py-20 border-t border-muted text-center">
      <p className="font-display italic text-[16px] sm:text-[20px] text-foreground mb-6 md:mb-8 px-2">
        A two-sided system: those who need to be heard,
        <br className="hidden sm:block" />
        <span className="sm:hidden"> </span>
        and those willing to listen.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2 sm:px-0">
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/seeker")} className="w-full sm:w-auto">
          Enter Cor Ad Cor
        </EchoButton>
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/listener")} className="w-full sm:w-auto">
          Become a Listener
        </EchoButton>
      </div>
    </section>
  );
};

/* ── Page ── */
const Index = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 border-b border-foreground bg-background">
        <div className="mx-auto flex w-full max-w-echo items-center justify-between px-2 py-1">
          <Link to="/" className="font-display italic text-[20px] sm:text-[24px] text-foreground select-none no-underline">
            <span className="mr-0.5">●</span> Cor ad Cor
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/about" className="font-body text-[11px] sm:text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline">
              {t("nav.about")}
            </Link>
            <Link to="/login" className="font-body text-[11px] sm:text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline">
              {t("nav.login")}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="echo-fade outline-none" aria-label="More options">
                  <MoreVertical size={18} strokeWidth={1.5} className="text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-foreground bg-background rounded-none min-w-[180px]">
                <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
                  <a href="#safety">{t("nav.safety")}</a>
                </DropdownMenuItem>
                <DropdownMenuItem className="font-body text-[12px] text-muted-foreground cursor-default rounded-none">
                  {t("nav.privacy")}
                </DropdownMenuItem>
                <DropdownMenuItem className="font-body text-[12px] text-muted-foreground cursor-default rounded-none">
                  {t("nav.terms")}
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
                  <Link to="/about">{t("nav.contact")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Content — pt accounts for fixed header */}
      <div className="mx-auto w-full max-w-echo px-2 sm:px-4 pt-[48px]">
        <HeroSection />
        <DualRoleSection />
        <PillarsSection />
        <HowItWorksSection />
        <PersonalSpaceSection />
        <PeerSupportSection />
        <ValuesSection />
        <FinalCTA />
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-foreground">
        <div className="mx-auto w-full max-w-echo flex flex-col sm:flex-row items-center justify-between px-2 py-1 gap-1 sm:gap-0">
          <p className="font-body text-[11px] text-muted-foreground text-center sm:text-left">
            {t("landing.footer")}
          </p>
          <nav className="flex gap-2 flex-wrap justify-center">
            <Link to="/about" className="font-body text-[11px] text-foreground echo-fade no-underline">{t("nav.about")}</Link>
            <a href="#safety" className="font-body text-[11px] text-foreground echo-fade no-underline">{t("nav.safety")}</a>
            <Link to="/signup/listener" className="font-body text-[11px] text-foreground echo-fade no-underline">Become a Listener</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
