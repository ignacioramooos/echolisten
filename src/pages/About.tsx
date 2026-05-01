import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Mail, Phone } from "lucide-react";
import { EchoButton } from "@/components/echo/EchoButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Header (mirrors Index/Why for consistency) ── */
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-10 border-b border-foreground bg-background">
    <div className="mx-auto flex w-full max-w-echo items-center justify-between px-2 py-1">
      <Link
        to="/"
        className="font-display italic text-[20px] sm:text-[24px] text-foreground select-none no-underline"
      >
        <span className="mr-0.5">●</span> Cor ad Cor
      </Link>
      <nav className="flex items-center gap-2">
        <Link
          to="/why"
          className="font-body text-[11px] sm:text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline"
        >
          Why
        </Link>
        <Link
          to="/about"
          className="font-body text-[11px] sm:text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline"
        >
          About
        </Link>
        <Link
          to="/login"
          className="font-body text-[11px] sm:text-[12px] uppercase tracking-widest text-foreground echo-fade no-underline"
        >
          Login
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="echo-fade outline-none" aria-label="More options">
              <MoreVertical size={18} strokeWidth={1.5} className="text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border border-foreground bg-background rounded-none min-w-[180px]"
          >
            <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
              <Link to="/why">Why we exist</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
              <a href="#contact">Contact</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  </header>
);

/* ── Hero ── */
const Hero = () => (
  <section className="px-2 pt-16 md:pt-24 pb-10 md:pb-16">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-4">
      About Cor ad Cor
    </p>
    <h1 className="font-display italic text-[40px] sm:text-[56px] md:text-[72px] leading-[1.05] text-foreground max-w-[760px] break-words">
      A quiet space, built by people who believe listening still matters.
    </h1>
    <p className="mt-6 font-body text-[13px] sm:text-[14px] text-muted-foreground max-w-[620px] leading-relaxed">
      Cor ad Cor — Latin for <em>heart to heart</em> — is an anonymous,
      free peer-support platform. No therapy. No advice. No noise. Just a real
      person on the other side, trained to hear you.
    </p>
  </section>
);

/* ── Section block ── */
const Block = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
      {kicker}
    </p>
    <h2 className="font-display italic text-[26px] sm:text-[32px] text-foreground mb-4 max-w-[680px] leading-tight">
      {title}
    </h2>
    <div className="font-body text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed max-w-[640px] flex flex-col gap-4">
      {children}
    </div>
  </section>
);

/* ── Principles ── */
const Principle = ({ label, desc }: { label: string; desc: string }) => (
  <div className="p-4 border border-muted">
    <p className="font-display italic text-[20px] sm:text-[22px] text-foreground leading-tight">
      {label}
    </p>
    <p className="font-body text-[11px] sm:text-[12px] text-muted-foreground mt-2 leading-snug">
      {desc}
    </p>
  </div>
);

const PrinciplesSection = () => (
  <section className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-6">
      What we stand on
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px">
      <Principle label="Anonymous" desc="No identities exchanged. No traces left behind." />
      <Principle label="Free" desc="No paywalls. No subscriptions. No upsells." />
      <Principle label="Human" desc="Real, trained people — never bots in disguise." />
      <Principle label="Quiet" desc="No streaks, no metrics, no engagement traps." />
    </div>
  </section>
);

/* ── Contact ── */
const ContactSection = () => (
  <section id="contact" className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
      Contact
    </p>
    <h2 className="font-display italic text-[26px] sm:text-[32px] text-foreground mb-4 max-w-[680px] leading-tight">
      Reach out.
    </h2>
    <p className="font-body text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed max-w-[640px] mb-6">
      For partnerships, press, listener applications, or anything else — we
      read every message.
    </p>
    <div className="flex flex-col gap-3 max-w-[480px]">
      <a
        href="mailto:cor@coradcor.org"
        className="flex items-center gap-3 p-3 border border-foreground echo-fade no-underline group"
      >
        <Mail size={16} strokeWidth={1.5} className="text-foreground shrink-0" />
        <div>
          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Email</p>
          <p className="font-body text-[14px] text-foreground">cor@coradcor.org</p>
        </div>
      </a>
      <a
        href="tel:+59892667755"
        className="flex items-center gap-3 p-3 border border-foreground echo-fade no-underline group"
      >
        <Phone size={16} strokeWidth={1.5} className="text-foreground shrink-0" />
        <div>
          <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground">Phone</p>
          <p className="font-body text-[14px] text-foreground">+598 92 667 755</p>
        </div>
      </a>
    </div>
    <p className="font-body text-[11px] text-muted-foreground mt-6 max-w-[480px] leading-relaxed">
      Note: This is not a crisis line. If you or someone you know is in
      immediate danger, please contact your local emergency services.
    </p>
  </section>
);

/* ── Final CTA ── */
const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-10 md:py-20 border-t border-muted text-center">
      <p className="font-display italic text-[18px] sm:text-[22px] text-foreground mb-8 px-2 max-w-[560px] mx-auto leading-snug">
        Two doors. One quiet room.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2 sm:px-0">
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/seeker")} className="w-full sm:w-auto">
          Enter Cor ad Cor
        </EchoButton>
        <EchoButton variant="solid" size="md" onClick={() => navigate("/signup/listener")} className="w-full sm:w-auto">
          Become a Listener
        </EchoButton>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <Header />

      <div className="mx-auto w-full max-w-echo px-2 sm:px-4 pt-[48px]">
        <Hero />

        <Block kicker="01 — Mission" title="To make being heard feel ordinary again.">
          <p>
            We exist to rebuild a layer that modern life has quietly stripped
            away: the simple, human experience of someone sitting with you while
            you say what's on your mind.
          </p>
          <p>
            Not to fix you. Not to diagnose you. Not to optimize you. Just to be
            present — anonymously, freely, and without an agenda.
          </p>
        </Block>

        <Block kicker="02 — What we are" title="Peer support, taken seriously.">
          <p>
            Cor ad Cor connects two kinds of people: those who need to talk, and
            those willing to listen. Every Listener completes <em>The Formation</em> — a
            multi-step training that covers presence, boundaries, safety, and
            the discipline of not advising.
          </p>
          <p>
            Sessions are anonymous and ephemeral by design. Nothing is sold.
            Nothing is gamified. The product is the conversation.
          </p>
        </Block>

        <Block kicker="03 — What we are not" title="A clear line, drawn on purpose.">
          <p>
            Cor ad Cor is <strong>not</strong> a crisis service, not therapy, not
            medical care, and not a social network. Listeners are trained
            volunteers — not clinicians.
          </p>
          <p>
            For emergencies, please contact your local crisis line or emergency
            services. For ongoing clinical needs, please seek a qualified
            professional. We sit beside those resources, not in place of them.
          </p>
        </Block>

        <PrinciplesSection />

        <ContactSection />

        <FinalCTA />
      </div>

      <footer className="mt-auto border-t border-foreground">
        <div className="mx-auto w-full max-w-echo flex flex-col sm:flex-row items-center justify-between px-2 py-1 gap-1 sm:gap-0">
          <p className="font-body text-[11px] text-muted-foreground text-center sm:text-left">
            Cor ad Cor — Peer support. No noise.
          </p>
          <nav className="flex gap-2 flex-wrap justify-center">
            <Link to="/" className="font-body text-[11px] text-foreground echo-fade no-underline">Home</Link>
            <Link to="/why" className="font-body text-[11px] text-foreground echo-fade no-underline">Why</Link>
            <Link to="/signup/listener" className="font-body text-[11px] text-foreground echo-fade no-underline">Become a Listener</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default About;
