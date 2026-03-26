import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Step1BasicInfo from "@/components/echo/signup/Step1BasicInfo";
import Step2Profile from "@/components/echo/signup/Step2Profile";
import Step3Topics from "@/components/echo/signup/Step3Topics";
import Step4Languages from "@/components/echo/signup/Step4Languages";
import Step5Verification from "@/components/echo/signup/Step5Verification";
import WelcomeScreen from "@/components/echo/signup/WelcomeScreen";

const TOTAL_STEPS = 5;

const stepTitles = (t: (k: string) => string) => [
  t("signup.step1.title"),
  t("signup.step2.title"),
  t("signup.step3.title"),
  t("signup.step4.title"),
  t("signup.step5.title"),
];

const ListenerSignup = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const titles = stepTitles(t);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Store all profile data in user_metadata — profile will be created in AuthCallback after email confirmation
    const { error: authErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: "listener",
          first_name: data.firstName,
          last_name: data.lastName,
          country: data.country,
          gender: data.gender,
          username: data.username,
          bio: data.bio,
          selected_avatar: data.selectedAvatar,
          topics_comfortable: data.comfortable || [],
          topics_avoid: data.avoid || [],
          topics_lived_experience: data.lived || [],
          languages: data.languages || [],
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authErr) { setError(authErr.message); setLoading(false); return; }

    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <Shell>
        <WelcomeScreen />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Step indicator */}
      <div className="flex items-center gap-0.5 mb-2">
        {titles.map((title, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i > 0 && <div className="w-2 h-px bg-foreground" />}
            <span className={`font-body text-[11px] ${i + 1 === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {i + 1 <= step ? "●" : "○"} {title}
            </span>
          </div>
        ))}
      </div>
      <p className="font-body text-[11px] text-muted-foreground mb-2">
        {t("signup.step", { current: step, total: TOTAL_STEPS })}
      </p>

      {step === 1 && <Step1BasicInfo data={data} onChange={setData} onNext={() => setStep(2)} />}
      {step === 2 && <Step2Profile data={data} onChange={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Step3Topics data={data} onChange={setData} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <Step4Languages data={data} onChange={setData} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <Step5Verification data={data} onChange={setData} onSubmit={handleSubmit} onBack={() => setStep(4)} loading={loading} error={error} />}
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-background px-2 py-4">
    <div className="w-full border border-foreground bg-background" style={{ maxWidth: 480 }}>
      <div className="px-3 pt-3 pb-1">
        <Link to="/" className="font-display italic text-[24px] text-foreground select-none no-underline">
          <span className="mr-0.5">●</span> Echo
        </Link>
      </div>
      <div className="border-t border-foreground" />
      <div className="px-3 py-3">{children}</div>
    </div>
  </div>
);

export default ListenerSignup;
