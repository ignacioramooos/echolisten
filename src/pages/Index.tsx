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

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-2">
      <h1 className="font-display text-[72px] leading-none text-foreground text-center md:text-[80px]">
        {t("landing.hero")}
      </h1>
      <p className="mt-2 font-body text-[14px] text-muted-foreground text-center max-w-[480px]">
        {t("landing.heroSub")}
      </p>
      <div className="mt-4 flex gap-1">
        <EchoButton variant="solid" size="md" onClick={() => navigate("/chat/new")}>{t("landing.findListener")}</EchoButton>
        <EchoButton variant="outline" size="md" onClick={() => navigate("/listener-signup")}>{t("landing.becomeListener")}</EchoButton>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const { t } = useTranslation();
  const steps = [
    { num: "01", heading: t("landing.step01"), desc: t("landing.step01Desc") },
    { num: "02", heading: t("landing.step02"), desc: t("landing.step02Desc") },
    { num: "03", heading: t("landing.step03"), desc: t("landing.step03Desc") },
  ];
  return (
    <section className="py-6">
      <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
        {t("landing.forSeekers")}
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
};

const formationSteps = [
  { num: "1", label: "Foundations" },
  { num: "2", label: "Techniques" },
  { num: "3", label: "Crisis Protocol" },
  { num: "4", label: "Bot Simulation ●", gate: true },
];

const FormationSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section className="py-6 border-t border-foreground">
      <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {t("landing.forListeners")}
      </p>
      <h2 className="font-display text-[36px] leading-tight">{t("landing.formationHeading")}</h2>
      <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
        {t("landing.formationDesc")}
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
          {t("landing.beginFormation")}
        </EchoButton>
      </div>
    </section>
  );
};

const TrustSection = () => {
  const { t } = useTranslation();
  const trustItems = [
    t("landing.trust1"),
    t("landing.trust2"),
    t("landing.trust3"),
  ];
  return (
    <section id="safety" className="py-6 border-t border-foreground">
      <h2 className="font-display text-[36px] leading-tight">{t("landing.trustHeading")}</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {trustItems.map((item) => (
          <li key={item} className="font-body text-[13px] text-foreground">
            — {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

const Index = () => {
  const { t } = useTranslation();
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
              {t("nav.about")}
            </Link>
            <Link to="/login" className="font-body text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline">
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

      <div className="mx-auto w-full max-w-echo px-2">
        <HeroSection />
      </div>

      <div className="w-full border-t border-foreground" />

      <div className="mx-auto w-full max-w-echo px-2">
        <HowItWorksSection />
        <FormationSection />
        <TrustSection />
      </div>

      <footer className="mt-auto border-t border-foreground">
        <div className="mx-auto w-full max-w-echo flex items-center justify-between px-2 py-1">
          <p className="font-body text-[11px] text-muted-foreground">
            {t("landing.footer")}
          </p>
          <nav className="flex gap-2">
            <Link to="/about" className="font-body text-[11px] text-foreground echo-fade no-underline">{t("nav.about")}</Link>
            <Link to="/about#safety" className="font-body text-[11px] text-foreground echo-fade no-underline">{t("nav.safety")}</Link>
            <Link to="/listener-signup" className="font-body text-[11px] text-foreground echo-fade no-underline">{t("landing.becomeListener")}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
