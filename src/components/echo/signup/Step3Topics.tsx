import { useState } from "react";
import { useTranslation } from "react-i18next";
import { allTopics } from "@/data/topics";

interface Props {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Section = "comfortable" | "avoid" | "lived";

const Step3Topics = ({ data, onChange, onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = allTopics.filter(tp => tp.toLowerCase().includes(search.toLowerCase()));

  const toggle = (section: Section, topic: string) => {
    const arr: string[] = data[section] || [];
    const next = arr.includes(topic) ? arr.filter(t => t !== topic) : [...arr, topic];
    onChange({ ...data, [section]: next });
  };

  const sections: { key: Section; label: string }[] = [
    { key: "comfortable", label: t("signup.step3.comfortable") },
    { key: "avoid", label: t("signup.step3.avoid") },
    { key: "lived", label: t("signup.step3.lived") },
  ];

  const canContinue = (data.comfortable?.length || 0) > 0;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-[32px] leading-tight text-foreground">{t("signup.step3.heading")}</h2>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t("signup.step3.searchPlaceholder")}
        className="w-full border border-foreground bg-background px-1 py-1 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.key} className="flex flex-col gap-0.5">
            <span className="font-body text-[11px] uppercase tracking-widest text-foreground font-medium sticky top-0 bg-background py-0.5">
              {sec.label}
            </span>
            {filtered.map(topic => {
              const checked = (data[sec.key] || []).includes(topic);
              return (
                <label key={topic} className="flex items-center gap-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(sec.key, topic)}
                    className="accent-foreground"
                  />
                  <span className="font-body text-[12px] text-foreground">{topic}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

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

export default Step3Topics;
