import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/data/topics";

interface Props {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4Languages = ({ data, onChange, onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const selected: string[] = data.languages || [];

  const toggle = (lang: string) => {
    const next = selected.includes(lang) ? selected.filter(l => l !== lang) : [...selected, lang];
    onChange({ ...data, languages: next });
  };

  const canContinue = selected.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-[32px] leading-tight text-foreground">{t("signup.step4.heading")}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {supportedLanguages.map(lang => {
          const active = selected.includes(lang);
          return (
            <button
              key={lang}
              onClick={() => toggle(lang)}
              className={`border border-foreground px-1 py-1 font-body text-[13px] echo-fade text-left ${active ? "bg-foreground text-background" : "bg-background text-foreground"}`}
            >
              {lang}
            </button>
          );
        })}
      </div>

      <p className="font-body text-[11px] text-muted-foreground mt-1">{t("signup.step4.missingLanguage")}</p>

      <div className="flex gap-1 mt-1">
        <button onClick={onBack} className="flex-1 border border-foreground bg-background text-foreground font-body text-[13px] uppercase tracking-widest py-1 echo-fade">
          {t("signup.back")}
        </button>
        <button onClick={onNext} disabled={!canContinue} className={`flex-1 border border-foreground bg-foreground text-background font-body text-[13px] uppercase tracking-widest py-1 echo-fade ${!canContinue ? "opacity-40 cursor-not-allowed" : ""}`}>
          {t("signup.next")}
        </button>
      </div>
    </div>
  );
};

export default Step4Languages;
