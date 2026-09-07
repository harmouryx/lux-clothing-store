/**
 * react-i18next singleton initialization.
 * Translations are bundled inline — no JSON files fetched at runtime.
 * Language switching is pure client-side via i18n.changeLanguage().
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/public/locales/en.json";
import es from "@/public/locales/es.json";
import fr from "@/public/locales/fr.json";
import it from "@/public/locales/it.json";

export const SUPPORTED_LOCALES = ["en", "es", "fr", "it"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_OPTIONS = [
  { code: "en" as SupportedLocale, label: "EN · English", flag: "🇺🇸", name: "English" },
  { code: "es" as SupportedLocale, label: "ES · Español", flag: "🇪🇸", name: "Español" },
  { code: "fr" as SupportedLocale, label: "FR · Français", flag: "🇫🇷", name: "Français" },
  { code: "it" as SupportedLocale, label: "IT · Italiano", flag: "🇮🇹", name: "Italiano" },
];

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
};

function detectInitialLang(): SupportedLocale {
  if (typeof window === "undefined") return "en";

  try {
    const saved = localStorage.getItem("lux_language_pref")?.toLowerCase();
    if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
      return saved as SupportedLocale;
    }
  } catch {
    // ignore
  }

  // Cookie fallback
  const match = document.cookie.match(/(^|; )lux_language_pref=([^;]*)/);
  if (match) {
    const cookieVal = decodeURIComponent(match[2]).toLowerCase();
    if (SUPPORTED_LOCALES.includes(cookieVal as SupportedLocale)) {
      return cookieVal as SupportedLocale;
    }
  }

  // Browser language fallback
  if (navigator.language) {
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
      return browserLang as SupportedLocale;
    }
  }

  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectInitialLang(),
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });
}

export default i18n;
