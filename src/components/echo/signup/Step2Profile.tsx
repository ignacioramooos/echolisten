import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { defaultAvatars } from "./avatars";

interface Props {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Profile = ({ data, onChange, onNext, onBack }: Props) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const set = (key: string, val: any) => onChange({ ...data, [key]: val });
  const bio: string = data.bio || "";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      set("avatarUrl", urlData.publicUrl);
      set("selectedAvatar", null);
    }
    setUploading(false);
  };

  const canContinue = (data.avatarUrl || data.selectedAvatar !== undefined) && bio.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-display text-[32px] leading-tight text-foreground">{t("signup.step2.heading")}</h2>

      <div className="flex flex-col gap-1">
        <span className="font-body text-[12px] uppercase tracking-widest text-foreground">{t("signup.step2.avatarLabel")}</span>

        {/* Upload */}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 border border-foreground bg-background px-2 py-1 font-body text-[12px] text-foreground echo-fade w-fit"
        >
          <Upload size={14} strokeWidth={1.5} />
          {uploading ? "Uploading..." : t("signup.step2.avatarUpload")}
        </button>

        {data.avatarUrl && !data.selectedAvatar && data.selectedAvatar !== 0 && (
          <div className="w-8 h-8 border border-foreground overflow-hidden">
            <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Default avatars */}
        <span className="font-body text-[11px] text-muted-foreground mt-0.5">{t("signup.step2.avatarDefault")}</span>
        <div className="grid grid-cols-6 gap-1">
          {defaultAvatars.map((Av, i) => (
            <button
              key={i}
              onClick={() => { set("selectedAvatar", i); set("avatarUrl", null); }}
              className={`w-full aspect-square border p-0.5 echo-fade ${data.selectedAvatar === i ? "border-foreground bg-gray-light" : "border-foreground"}`}
            >
              <Av />
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-0.5">
        <label className="font-body text-[12px] uppercase tracking-widest text-foreground">{t("signup.step2.bioLabel")}</label>
        <textarea
          value={bio}
          onChange={e => { if (e.target.value.length <= 300) set("bio", e.target.value); }}
          placeholder={t("signup.step2.bioPlaceholder")}
          rows={4}
          className="w-full border border-foreground bg-background px-1 py-1 font-body text-[14px] text-foreground placeholder:text-muted-foreground outline-none resize-none"
        />
        <span className="font-body text-[11px] text-muted-foreground text-right">
          {t("signup.step2.bioCounter", { count: bio.length })}
        </span>
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

export default Step2Profile;
