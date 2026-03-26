import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/echo/PageShell";

const About = () => {
  const { t } = useTranslation();
  return (
    <PageShell navLinks={[{ label: t("about.backHome"), href: "/" }]}>
      <h1 className="font-display text-[48px] leading-tight text-foreground">{t("about.heading")}</h1>

      <section className="mt-4">
        <h2 className="font-display text-[28px] leading-tight text-foreground">What is Echo?</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
          Echo is an anonymous, free peer-support platform that connects people who need to talk
          with trained volunteer Listeners. No therapy. No advice. Just presence.
        </p>
      </section>

      <section className="mt-4 border-t border-foreground pt-4">
        <h2 className="font-display text-[28px] leading-tight text-foreground">Our Mission</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
          {t("about.placeholder")}
        </p>
      </section>

      <section className="mt-4 border-t border-foreground pt-4">
        <h2 className="font-display text-[28px] leading-tight text-foreground">The Formation</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
          Every Echo Listener completes a rigorous multi-step training program before they can
          accept sessions. This ensures quality, safety, and empathy in every conversation.
        </p>
      </section>

      <section className="mt-4 border-t border-foreground pt-4">
        <h2 className="font-display text-[28px] leading-tight text-foreground">Safety</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
          Echo is not a crisis service, therapy, or medical support. Listeners are trained
          volunteers, not clinicians. For emergencies, contact your local crisis services.
        </p>
      </section>

      <section className="mt-4 border-t border-foreground pt-4">
        <h2 className="font-display text-[28px] leading-tight text-foreground">Contact</h2>
        <p className="font-body text-[13px] text-muted-foreground mt-1 max-w-[600px]">
          {t("about.placeholder")}
        </p>
      </section>
    </PageShell>
  );
};

export default About;
