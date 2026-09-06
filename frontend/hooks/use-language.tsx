"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import en from "@/public/locales/en.json";
import es from "@/public/locales/es.json";
import fr from "@/public/locales/fr.json";
import it from "@/public/locales/it.json";


export type SupportedLocale = "en" | "es" | "fr" | "it";
export type Language = SupportedLocale | "EN" | "ES" | "FR" | "IT";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "es", "fr", "it"];

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
  flag: string;
  name: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "en", label: "EN · English", flag: "🇺🇸", name: "English" },
  { code: "es", label: "ES · Español", flag: "🇪🇸", name: "Español" },
  { code: "fr", label: "FR · Français", flag: "🇫🇷", name: "Français" },
  { code: "it", label: "IT · Italiano", flag: "🇮🇹", name: "Italiano" },
];

interface LanguageContextType {
  lang: SupportedLocale;
  setLang: (lang: Language) => void;
  cycleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  tArray: <T = any>(key: string, defaultArray?: T[]) => T[];
  locales: readonly SupportedLocale[];
  localeOptions: typeof LOCALE_OPTIONS;
}

const dictionaries: Record<SupportedLocale, Record<string, any>> = {
  en,
  es,
  fr,
  it,
};

function resolvePath(obj: string, path: string) {
  if (!obj || typeof obj !== "object") return undefined;
  if (path in obj) return obj[path];

  const segments = path.split(".");
  let current = obj;
  for (const seg of segments) {
    if (current && typeof current === "object" && seg in current) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return current;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => { },
  cycleLanguage: () => { },
  t: (key: string, defaultText?: string) => defaultText || key,
  tArray: <T = string>(_key: string, defaultArray: T[] = []) => defaultArray,
  locales: SUPPORTED_LOCALES,
  localeOptions: LOCALE_OPTIONS,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Detect initial language based on:
  // 1. localStorage (lux_language_pref)
  // 2. Cookie lux_language_pref
  // 3. Regional browser language (navigator.language)
  // 4. Default 'en'
  const [lang, setLanguage] = useState<SupportedLocale>(() => {
    if (typeof window === "undefined") return "en";

    // 1. Check localStorage
    try {
      const saved = localStorage.getItem("lux_language_pref")?.toLowerCase();
      if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
        return saved as SupportedLocale;
      }
    } catch {
      // Ignore
    }

    // 2. Check Cookie
    const cookieVal = getCookie("lux_language_pref")?.toLowerCase();
    if (cookieVal && SUPPORTED_LOCALES.includes(cookieVal as SupportedLocale)) {
      return cookieVal as SupportedLocale;
    }

    // 3. Regional Browser detection (e.g. es-ES -> es, fr-FR -> fr, it-IT -> it)
    if (typeof navigator !== "undefined" && navigator.language) {
      const browserLang = navigator.language.split("-")[0].toLowerCase();
      if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
        return browserLang as SupportedLocale;
      }
    }

    return "en";
  });

  // Handler for setting language and updating storage and cookie
  const setLang = useCallback((newLang: Language) => {
    const normalized = newLang.toLowerCase() as SupportedLocale;
    const validLang = SUPPORTED_LOCALES.includes(normalized) ? normalized : "en";

    setLanguage(validLang);
    setCookie("lux_language_pref", validLang);
    try {
      localStorage.setItem("lux_language_pref", validLang);
    } catch {
      // Ignore
    }
  }, []);

  const cycleLanguage = useCallback(() => {
    const idx = SUPPORTED_LOCALES.indexOf(lang);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
    setLang(next);
  }, [lang, setLang]);

  const t = useMemo(() => {
    return (key: string, defaultText?: string): string => {
      const val = resolvePath(dictionaries[lang], key);
      if (typeof val === "string") return val;

      const fallbackVal = resolvePath(dictionaries.en, key);
      if (typeof fallbackVal === "string") return fallbackVal;

      return defaultText || key;
    };
  }, [lang]);

  const tArray = useMemo(() => {
    return <T = any>(key: string, defaultArray: T[] = []): T[] => {
      const val = resolvePath(dictionaries[lang], key);
      if (Array.isArray(val)) return val as T[];

      const fallbackVal = resolvePath(dictionaries.en, key);
      if (Array.isArray(fallbackVal)) return fallbackVal as T[];

      return defaultArray;
    };
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        cycleLanguage,
        t,
        tArray,
        locales: SUPPORTED_LOCALES,
        localeOptions: LOCALE_OPTIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

