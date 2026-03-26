import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import zh from "@/locales/zh.json";
import ar from "@/locales/ar.json";

const SUPPORTED_LANGUAGES = ["en", "es", "pt", "fr", "de", "zh", "ar"];

// Detect browser language
function detectLanguage(): string {
  const browserLang = navigator.language?.split("-")[0] || "en";
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : "en";
}

// Check localStorage for user preference
const storedLang = localStorage.getItem("echo-language");
const initialLang = storedLang || detectLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
    zh: { translation: zh },
    ar: { translation: ar },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
];

export function changeLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem("echo-language", lang);
  // Set dir for RTL languages
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export default i18n;
