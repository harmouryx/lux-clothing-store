"use client";

/**
 * useLanguage — react-i18next wrapper with locale-based router navigation.
 *
 * Switching language updates:
 *   1. i18n client instance (instant reactivity)
 *   2. NEXT_LOCALE cookie (for next-i18n-router)
 *   3. lux_language_pref storage
 *   4. URL path (e.g. /fr/products -> /es/products)
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import {
  SUPPORTED_LOCALES,
  LOCALE_OPTIONS,
  type SupportedLocale,
} from "@/lib/i18n";

export type { SupportedLocale };
export type Language = SupportedLocale | Uppercase<SupportedLocale>;
export { SUPPORTED_LOCALES, LOCALE_OPTIONS };

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function useLanguage() {
  const { t: i18nT, i18n: instance } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const lang = (instance.language?.split("-")[0] ?? "en") as SupportedLocale;

  const setLang = useCallback(
    (newLang: Language) => {
      const normalized = newLang.toLowerCase() as SupportedLocale;
      const validLang = (SUPPORTED_LOCALES as readonly string[]).includes(normalized)
        ? (normalized as SupportedLocale)
        : "en";

      instance.changeLanguage(validLang);
      setCookie("NEXT_LOCALE", validLang);
      setCookie("lux_language_pref", validLang);
      try {
        localStorage.setItem("lux_language_pref", validLang);
      } catch {
        // ignore
      }

      if (pathname) {
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length > 0 && (SUPPORTED_LOCALES as readonly string[]).includes(segments[0])) {
          segments[0] = validLang;
        } else {
          segments.unshift(validLang);
        }
        const newPath = "/" + segments.join("/");
        router.push(newPath);
        router.refresh();
      }
    },
    [instance, pathname, router]
  );

  const cycleLanguage = useCallback(() => {
    const idx = SUPPORTED_LOCALES.indexOf(lang);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length];
    setLang(next);
  }, [lang, setLang]);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const result = i18nT(key, { defaultValue: "__MISSING__" });
      if (result !== "__MISSING__") return result;
      return defaultText ?? key;
    },
    [i18nT]
  );

  const tArray = useCallback(
    <T = unknown>(key: string, defaultArray: T[] = []): T[] => {
      const result = i18nT(key, { returnObjects: true, defaultValue: null });
      if (Array.isArray(result)) return result as T[];
      return defaultArray;
    },
    [i18nT]
  );

  return {
    lang,
    setLang,
    cycleLanguage,
    t,
    tArray,
    locales: SUPPORTED_LOCALES,
    localeOptions: LOCALE_OPTIONS,
    i18n: instance,
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
