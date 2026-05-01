import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EchoButton } from "@/components/echo/EchoButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Header (mirrors Index for consistency) ── */
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
              <Link to="/about">About</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-body text-[12px] text-foreground cursor-pointer rounded-none">
              <Link to="/why">Why we exist</Link>
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
      Why Cor ad Cor exists
    </p>
    <h1 className="font-display italic text-[40px] sm:text-[56px] md:text-[72px] leading-[1.05] text-foreground max-w-[760px] break-words">
      The world has more noise than ever, and fewer people who listen.
    </h1>
    <p className="mt-6 font-body text-[13px] sm:text-[14px] text-muted-foreground max-w-[620px] leading-relaxed">
      We built Cor ad Cor as a response to a quiet, global crisis — one that
      rarely makes headlines, but shapes how millions of people live, work,
      sleep, and feel each day.
    </p>
  </section>
);

/* ── Stat row ── */
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="p-4 border border-muted">
    <p className="font-display italic text-[36px] sm:text-[44px] text-foreground leading-none">
      {value}
    </p>
    <p className="font-body text-[11px] sm:text-[12px] text-muted-foreground mt-2 leading-snug">
      {label}
    </p>
  </div>
);

const StatsSection = () => (
  <section className="py-10 md:py-16 border-t border-muted">
    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-6">
      The scale of it
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px">
      <Stat value="1 in 2" label="adults report experiencing loneliness" />
      <Stat value="+26%" label="higher risk of premature death from chronic loneliness" />
      <Stat value="+50%" label="higher risk of dementia in isolated older adults" />
      <Stat value="15" label="cigarettes a day — the health equivalent of chronic loneliness" />
    </div>
    <p className="font-body text-[11px] text-muted-foreground mt-4">
      Sources: U.S. Surgeon General Advisory (2023), WHO Mental Health Atlas (2024).
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

/* ── Final CTA ── */
const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-10 md:py-20 border-t border-muted text-center">
      <p className="font-display italic text-[18px] sm:text-[22px] text-foreground mb-8 px-2 max-w-[560px] mx-auto leading-snug">
        Cor ad Cor is a quiet answer to a loud problem:
        <br className="hidden sm:block" /> a place to be heard, by a real human.
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

const Why = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <Header />

      <div className="mx-auto w-full max-w-echo px-2 sm:px-4 pt-[48px]">
        <Hero />
        <StatsSection />

        <Block kicker="01 — The silent crisis" title="A loneliness epidemic, hiding in plain sight.">
          <p>
            Roughly half of the global adult population reports experiencing
            loneliness. It is not a mood or a season — it has become a baseline
            condition of modern life.
          </p>
          <p>
            The "third places" that once held our emotional lives — cafés,
            churches, community halls, neighborhood streets — have eroded.
            Digital interaction has multiplied, but the felt sense of being
            <em> known</em> has shrunk.
          </p>
          <p>
            Chronic loneliness is now associated with a 26–29% higher risk of
            premature death, a 29% higher risk of heart disease, and a 32%
            higher risk of stroke. Its toll on the body matches that of smoking
            up to 15 cigarettes a day.
          </p>
        </Block>

        <Block kicker="02 — The care gap" title="Clinical care alone cannot meet what people are carrying.">
          <p>
            The mental health system, as it stands, is built for diagnosis. It
            asks people to be ill enough to qualify, articulate enough to
            describe it, and resourced enough to afford it.
          </p>
          <p>
            Most everyday distress — grief, transition, exhaustion, fear,
            shame — does not look like a disorder. It looks like a person who
            simply has nowhere to put what they feel.
          </p>
          <p>
            Therapy is essential, and irreplaceable for those who need it. But
            it cannot, on its own, hold the emotional weight of a planet of
            people who just need to be heard.
          </p>
        </Block>

        <Block kicker="03 — The missing middle" title="Between silence and a clinic, there is almost nothing.">
          <p>
            Most people sit in a space the system doesn't see: not in crisis,
            not in therapy, not okay. They carry their day quietly, then carry
            it home.
          </p>
          <p>
            For them, the question isn't <em>"what is wrong with me?"</em> —
            it's <em>"is there anywhere I can say this out loud?"</em>
          </p>
          <p>
            Peer support — real people, present and trained to listen without
            fixing — is the layer that has been missing. It is not a
            replacement for care. It is the human infrastructure underneath it.
          </p>
        </Block>

        <Block kicker="04 — Why it has to be human" title="Algorithms can answer. Only people can witness.">
          <p>
            Being heard is not an information problem. It is a nervous system
            event. When another human is genuinely present with us, our body
            settles in a way no chatbot, feed, or productivity tool can
            replicate.
          </p>
          <p>
            We didn't build Cor ad Cor to optimize feelings. We built it to
            protect the slow, unglamorous, deeply human act of one person
            sitting with another.
          </p>
          <p>
            No gamification. No streaks. No noise. Just a quiet space, an
            anonymous shield, and someone on the other side who chose to be
            there.
          </p>
        </Block>

        <FinalCTA />
      </div>

      <footer className="mt-auto border-t border-foreground">
        <div className="mx-auto w-full max-w-echo flex flex-col sm:flex-row items-center justify-between px-2 py-1 gap-1 sm:gap-0">
          <p className="font-body text-[11px] text-muted-foreground text-center sm:text-left">
            Cor ad Cor — Peer support. No noise.
          </p>
          <nav className="flex gap-2 flex-wrap justify-center">
            <Link to="/" className="font-body text-[11px] text-foreground echo-fade no-underline">Home</Link>
            <Link to="/about" className="font-body text-[11px] text-foreground echo-fade no-underline">About</Link>
            <Link to="/signup/listener" className="font-body text-[11px] text-foreground echo-fade no-underline">Become a Listener</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Why;
