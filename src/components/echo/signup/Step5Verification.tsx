import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface Props {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
}

const HCAPTCHA_SITE_KEY = "b522d150-2c12-4678-bbc6-82bee8fce844";

const Step5Verification = ({ data, onChange, onSubmit, onBack, loading, error }: Props) => {
  const { t } = useTranslation();
  const captchaRef = useRef<HCaptcha>(null);
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });

  const canSubmit = data.captchaToken && data.checkSafety && data.checkPeerSupport && data.checkTerms && !loading;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-[32px] leading-tight text-foreground">{t("signup.step5.heading")}</h2>

      <div className="flex flex-col gap-1">
        <span className="font-body text-[12px] text-muted-foreground">{t("signup.step5.captchaLabel")}</span>
        <HCaptcha
          ref={captchaRef}
          sitekey={HCAPTCHA_SITE_KEY}
          onVerify={token => set("captchaToken", token)}
          onExpire={() => set("captchaToken", null)}
          theme="light"
        />
      </div>

      <label className="flex items-start gap-1 cursor-pointer">
        <input type="checkbox" checked={!!data.checkSafety} onChange={e => set("checkSafety", e.target.checked)} className="mt-[3px] accent-foreground" />
        <span className="font-body text-[11px] text-foreground">{t("signup.step5.checkSafety")}</span>
      </label>

      <label className="flex items-start gap-1 cursor-pointer">
        <input type="checkbox" checked={!!data.checkPeerSupport} onChange={e => set("checkPeerSupport", e.target.checked)} className="mt-[3px] accent-foreground" />
        <span className="font-body text-[11px] text-foreground">{t("signup.step5.checkPeerSupport")}</span>
      </label>

      <label className="flex items-start gap-1 cursor-pointer">
        <input type="checkbox" checked={!!data.checkTerms} onChange={e => set("checkTerms", e.target.checked)} className="mt-[3px] accent-foreground" />
        <span className="font-body text-[11px] text-foreground">{t("signup.step5.checkTerms")}</span>
      </label>

      {error && <p className="font-body text-[11px] text-foreground">⚠ {error}</p>}

      <div className="flex gap-1 mt-1">
        <button onClick={onBack} className="flex-1 border border-foreground bg-background text-foreground font-body text-[13px] uppercase tracking-widest py-1 echo-fade">
          {t("signup.back")}
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex-1 border border-foreground bg-foreground text-background font-body text-[13px] uppercase tracking-widest py-1 echo-fade ${!canSubmit ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {loading ? t("signup.step5.submitting") : t("signup.step5.submit")}
        </button>
      </div>
    </div>
  );
};

export default Step5Verification;
