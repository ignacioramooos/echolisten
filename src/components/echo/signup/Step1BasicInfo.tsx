import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";

interface Props {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  onNext: () => void;
}

const Step1BasicInfo = ({ data, onChange, onNext }: Props) => {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const set = (key: string, val: any) => onChange({ ...data, [key]: val });

  // Real-time username check
  useEffect(() => {
    const u = data.username?.trim();
    if (!u || u.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data: available } = await supabase.rpc("check_username_available", { desired_username: u });
      setUsernameStatus(available ? "available" : "taken");
    }, 500);
    return () => clearTimeout(timer);
  }, [data.username]);

  const canContinue =
    data.firstName?.trim() && data.lastName?.trim() && data.country &&
    data.gender?.trim() && data.username?.trim() && usernameStatus === "available" &&
    data.email?.trim() && data.password?.length >= 6 && data.ageGate;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-[32px] leading-tight text-foreground">{t("signup.step1.heading")}</h2>

      <div className="grid grid-cols-2 gap-1">
        <Field label={t("signup.step1.firstName")} value={data.firstName || ""} onChange={v => set("firstName", v)} />
        <Field label={t("signup.step1.lastName")} value={data.lastName || ""} onChange={v => set("lastName", v)} />
      </div>

      {/* Country */}
      <div className="flex flex-col gap-0.5">
        <label className="font-body text-[12px] uppercase tracking-widest text-foreground">{t("signup.step1.country")}</label>
        <select
          value={data.country || ""}
          onChange={e => set("country", e.target.value)}
          className="w-full border border-foreground bg-background px-1 py-1 font-body text-[14px] text-foreground outline-none"
        >
          <option value="">{t("signup.step1.countryPlaceholder")}</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <Field label={t("signup.step1.gender")} placeholder={t("signup.step1.genderPlaceholder")} value={data.gender || ""} onChange={v => set("gender", v)} />

      {/* Username */}
      <div className="flex flex-col gap-0.5">
        <label className="font-body text-[12px] uppercase tracking-widest text-foreground">{t("signup.step1.username")}</label>
        <div className="relative">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 font-body text-[14px] text-muted-foreground">@</span>
          <input
            value={data.username || ""}
            onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder={t("signup.step1.usernamePlaceholder")}
            className="w-full border border-foreground bg-background pl-3 pr-4 py-1 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2">
            {usernameStatus === "checking" && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
            {usernameStatus === "available" && <Check size={14} className="text-foreground" />}
            {usernameStatus === "taken" && <X size={14} className="text-foreground" />}
          </span>
        </div>
        {usernameStatus === "taken" && <span className="font-body text-[11px] text-foreground">{t("signup.step1.usernameTaken")}</span>}
      </div>

      <Field label={t("signup.step1.email")} type="email" placeholder={t("signup.step1.emailPlaceholder")} value={data.email || ""} onChange={v => set("email", v)} />

      {/* Password */}
      <div className="flex flex-col gap-0.5">
        <label className="font-body text-[12px] uppercase tracking-widest text-foreground">{t("signup.step1.password")}</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={data.password || ""}
            onChange={e => set("password", e.target.value)}
            placeholder={t("signup.step1.passwordPlaceholder")}
            minLength={6}
            className="w-full border border-foreground bg-background px-1 py-1 pr-5 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-1 top-1/2 -translate-y-1/2 echo-fade" tabIndex={-1}>
            {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Age gate */}
      <label className="flex items-start gap-1 cursor-pointer mt-1">
        <input type="checkbox" checked={!!data.ageGate} onChange={e => set("ageGate", e.target.checked)} className="mt-[3px] accent-foreground" />
        <span className="font-body text-[11px] text-foreground">{t("signup.step1.ageGate")}</span>
      </label>
      {data.ageGate === false && (
        <p className="font-body text-[11px] text-muted-foreground border border-foreground p-1">{t("signup.step1.ageGateWarning")}</p>
      )}

      <button
        onClick={onNext}
        disabled={!canContinue}
        className={`mt-1 w-full border border-foreground bg-foreground text-background font-body text-[13px] uppercase tracking-widest py-1 echo-fade ${!canContinue ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {t("signup.next")}
      </button>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div className="flex flex-col gap-0.5">
    <label className="font-body text-[12px] uppercase tracking-widest text-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-foreground bg-background px-1 py-1 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
    />
  </div>
);

export default Step1BasicInfo;
