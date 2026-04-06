import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { EchoLogo } from "@/components/echo/EchoLogo";
import { EchoButton } from "@/components/echo/EchoButton";
import { EchoInput } from "@/components/echo/EchoInput";
import { LANGUAGE_OPTIONS, changeLanguage } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

/*
 * Justification for personalization: Research suggests environment customization
 * increases emotional comfort and reduces anxiety during mental health support interactions.
 */

const TABS = ["profile", "appearance", "notifications", "privacy", "support"] as const;
type Tab = typeof TABS[number];

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("seeker");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Listener profile data
  const [bio, setBio] = useState("");
  const [topicsComfortable, setTopicsComfortable] = useState<string[]>([]);
  const [topicsAvoid, setTopicsAvoid] = useState<string[]>([]);
  const [topicsLived, setTopicsLived] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [chatBgUrl, setChatBgUrl] = useState<string | null>(null);
  const [chatBgIntensity, setChatBgIntensity] = useState(20);
  const [preferredLang, setPreferredLang] = useState(i18n.language);

  // Privacy
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Support
  const [supportMessage, setSupportMessage] = useState("");
  const [supportName, setSupportName] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);
      setSupportName(user.email || "");

      // Resolve role from profile tables, not metadata
      const { data: listenerProfile } = await (supabase as any)
        .from("listener_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (listenerProfile) {
        setUserRole("listener");
        const profile = listenerProfile;

        if (true) {
          setBio(profile.bio || "");
          setTopicsComfortable(profile.topics_comfortable || []);
          setTopicsAvoid(profile.topics_avoid || []);
          setTopicsLived(profile.topics_lived_experience || []);
          setLanguages(profile.languages || []);
          setAvatarUrl(profile.avatar_url);
          setTheme(profile.theme || "light");
          document.documentElement.setAttribute("data-theme", profile.theme || "light");
          setPreferredLang(profile.preferred_language || "en");
          setChatBgUrl(profile.chat_bg_url || null);
          setChatBgIntensity(profile.chat_bg_intensity || 20);
        }
      } else {
        // Check if seeker
        const { data: seekerProfile } = await (supabase as any)
          .from("seeker_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (seekerProfile) {
          setUserRole("seeker");
        } else {
          navigate("/login", { replace: true });
          return;
        }
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const dashboardPath = userRole === "listener" ? "/dashboard/listener" : "/dashboard/seeker";

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    await (supabase as any)
      .from("listener_profiles")
      .update({
        bio,
        topics_comfortable: topicsComfortable,
        topics_avoid: topicsAvoid,
        topics_lived_experience: topicsLived,
        languages,
      })
      .eq("user_id", userId);
    setSaving(false);
    toast.success(t("settings.saved"));
  };

  const saveAppearance = async () => {
    if (!userId) return;
    setSaving(true);
    document.documentElement.setAttribute("data-theme", theme);
    changeLanguage(preferredLang);
    if (userRole === "listener") {
      await (supabase as any)
        .from("listener_profiles")
        .update({
          theme,
          preferred_language: preferredLang,
          chat_bg_intensity: chatBgIntensity,
        })
        .eq("user_id", userId);
    }
    setSaving(false);
    toast.success(t("settings.saved"));
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File must be under 2MB"); return; }

    const ext = file.name.split(".").pop();
    const path = `${userId}/bg.${ext}`;

    const { error } = await supabase.storage.from("chat-backgrounds").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); return; }

    const { data } = supabase.storage.from("chat-backgrounds").getPublicUrl(path);
    const url = data.publicUrl;
    setChatBgUrl(url);

    await (supabase as any).from("listener_profiles").update({ chat_bg_url: url }).eq("user_id", userId);
    toast.success("Background uploaded");
  };

  const removeBg = async () => {
    if (!userId) return;
    setChatBgUrl(null);
    await (supabase as any).from("listener_profiles").update({ chat_bg_url: null }).eq("user_id", userId);
    toast.success("Background removed");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    toast.info("Account deletion requested. This feature will be fully implemented soon.");
    setShowDeleteConfirm(false);
  };

  const handleSubmitTicket = () => {
    setTicketSent(true);
    toast.success(t("settings.ticketSent"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-[13px] text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-foreground">
        <div className="mx-auto w-full max-w-echo px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EchoLogo />
            <button
              onClick={() => navigate(dashboardPath)}
              className="font-body text-[11px] inline-flex items-center gap-1 text-muted-foreground echo-fade bg-transparent border-none cursor-pointer p-0"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </button>
          </div>
          <span className="font-body text-[11px] uppercase tracking-widest text-muted-foreground">
            {t("settings.title")}
          </span>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-echo px-2 py-3">
        <div className="flex border-b border-foreground mb-3 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-body text-[11px] uppercase tracking-widest px-2 py-1 border-b-2 echo-fade whitespace-nowrap ${
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {t(`settings.${tab}`)}
            </button>
          ))}
        </div>

        {/* Profile Tab — only for listeners */}
        {activeTab === "profile" && userRole === "listener" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.bio")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => e.target.value.length <= 300 && setBio(e.target.value)}
                placeholder={t("settings.bioPlaceholder")}
                className="w-full border border-foreground bg-background px-1 py-1 font-body text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none mt-0.5"
                rows={4}
              />
              <span className="font-body text-[10px] text-muted-foreground">{bio.length}/300</span>
            </div>

            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.topics")}
              </label>
              <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                Comfortable: {topicsComfortable.length} selected
              </p>
              <p className="font-body text-[10px] text-muted-foreground">
                Avoid: {topicsAvoid.length} selected
              </p>
              <p className="font-body text-[10px] text-muted-foreground">
                Lived experience: {topicsLived.length} selected
              </p>
            </div>

            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.languages")}
              </label>
              <p className="font-body text-[12px] text-muted-foreground mt-0.5">
                {languages.length > 0 ? languages.join(", ") : "None selected"}
              </p>
            </div>

            <EchoButton variant="solid" size="sm" onClick={saveProfile} disabled={saving}>
              {saving ? "..." : t("settings.save")}
            </EchoButton>
          </div>
        )}

        {activeTab === "profile" && userRole === "seeker" && (
          <div className="flex flex-col gap-3">
            <p className="font-body text-[13px] text-muted-foreground">
              Seeker profiles are minimal. You can update your language and appearance preferences in the Appearance tab.
            </p>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.language")}
              </label>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setPreferredLang(lang.code)}
                    className={`font-body text-[12px] border px-1.5 py-0.5 echo-fade ${
                      preferredLang === lang.code
                        ? "bg-foreground text-background border-foreground"
                        : "border-foreground text-foreground"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.theme")}
              </label>
              <div className="flex gap-1 mt-1">
                {(["light", "dark"] as const).map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTheme(t_)}
                    className={`font-body text-[12px] border px-2 py-1 echo-fade ${
                      theme === t_
                        ? "bg-foreground text-background border-foreground"
                        : "border-foreground text-foreground"
                    }`}
                  >
                    {t_ === "light" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>
            </div>

            {userRole === "listener" && (
              <div>
                <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                  {t("settings.chatBackground")}
                </label>
                {chatBgUrl && (
                  <div className="border border-foreground p-1 mb-1 inline-block">
                    <div className="w-[120px] h-[80px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${chatBgUrl})`, opacity: chatBgIntensity / 100 }} />
                  </div>
                )}
                <div className="flex gap-1">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBgUpload} className="hidden" />
                    <span className="font-body text-[12px] border border-foreground px-1.5 py-0.5 echo-fade inline-block">
                      {t("settings.uploadImage")}
                    </span>
                  </label>
                  {chatBgUrl && (
                    <button onClick={removeBg} className="font-body text-[12px] border border-foreground px-1.5 py-0.5 text-muted-foreground echo-fade">
                      Remove
                    </button>
                  )}
                </div>
                {chatBgUrl && (
                  <div className="mt-1">
                    <label className="font-body text-[10px] text-muted-foreground">
                      Intensity: {chatBgIntensity}%
                    </label>
                    <input type="range" min={10} max={40} value={chatBgIntensity}
                      onChange={(e) => setChatBgIntensity(Number(e.target.value))} className="w-full mt-0.5" />
                  </div>
                )}
              </div>
            )}

            <EchoButton variant="solid" size="sm" onClick={saveAppearance} disabled={saving}>
              {saving ? "..." : t("settings.save")}
            </EchoButton>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                {t("settings.emailNotifications")}
              </label>
              <div className="border border-foreground p-2 mt-1 flex items-center justify-between">
                <div>
                  <p className="font-body text-[12px] text-foreground">{t("settings.notifyNewSessions")}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{t("settings.notifySub")}</p>
                </div>
                <span className="font-body text-[10px] text-muted-foreground border border-foreground px-1 py-0.5">
                  {t("settings.comingSoon")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-display text-[24px] leading-tight">{t("settings.deleteAccount")}</h3>
              <p className="font-body text-[12px] text-muted-foreground mt-1">
                {t("settings.deleteWarning")}
              </p>

              {!showDeleteConfirm ? (
                <EchoButton variant="outline" size="sm" className="mt-2" onClick={() => setShowDeleteConfirm(true)}>
                  {t("settings.deleteAccount")}
                </EchoButton>
              ) : (
                <div className="border border-foreground p-2 mt-2">
                  <p className="font-body text-[12px] text-foreground mb-1">{t("settings.deleteConfirm")}</p>
                  <EchoInput value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" />
                  <div className="flex gap-1 mt-1">
                    <EchoButton variant="solid" size="sm" onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE"} className={deleteConfirmText !== "DELETE" ? "opacity-40" : ""}>
                      {t("settings.deleteButton")}
                    </EchoButton>
                    <EchoButton variant="outline" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                      Cancel
                    </EchoButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === "support" && (
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-[24px] leading-tight">{t("settings.supportHeading")}</h3>
            {!ticketSent ? (
              <div className="flex flex-col gap-2">
                <EchoInput label={t("settings.supportName")} value={supportName} onChange={(e) => setSupportName(e.target.value)} />
                <div>
                  <label className="font-body text-[11px] uppercase tracking-widest text-foreground">
                    {t("settings.supportMessage")}
                  </label>
                  <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder={t("settings.supportPlaceholder")}
                    className="w-full border border-foreground bg-background px-1 py-1 font-body text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none mt-0.5"
                    rows={5} />
                </div>
                <EchoButton variant="solid" size="sm" onClick={handleSubmitTicket}
                  disabled={!supportMessage.trim()} className={!supportMessage.trim() ? "opacity-40" : ""}>
                  {t("settings.submitTicket")}
                </EchoButton>
              </div>
            ) : (
              <p className="font-body text-[13px] text-muted-foreground">{t("settings.ticketSent")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
