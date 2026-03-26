import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const milestones = [
    { label: t("signup.welcome.registration"), done: true },
    { label: t("signup.welcome.formation"), done: false },
    { label: t("signup.welcome.firstSession"), done: false },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-[40px] leading-tight text-foreground">{t("signup.welcome.heading")}</h1>
      <p className="font-body text-[13px] text-foreground leading-relaxed">{t("signup.welcome.body")}</p>

      {/* Progress bar */}
      <div className="flex items-center gap-0.5 mt-1">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i > 0 && <div className="w-4 h-px bg-foreground" />}
            <div className="flex items-center gap-0.5">
              <span className="font-body text-[14px] text-foreground">{m.done ? "●" : "○"}</span>
              <span className="font-body text-[11px] text-foreground">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/formation")}
        className="mt-2 w-full border border-foreground bg-foreground text-background font-body text-[13px] uppercase tracking-widest py-1 echo-fade"
      >
        {t("signup.welcome.begin")}
      </button>
    </div>
  );
};

export default WelcomeScreen;
