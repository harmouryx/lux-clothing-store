"use client";

import React from "react";
import { useLanguage, SupportedLocale } from "@/hooks/use-language";
import { GlobeIcon, ChevronDownIcon } from "lucide-react";

interface LanguageSelectProps {
  variant?: "header" | "footer" | "sidebar" | "compact";
  className?: string;
}

const LOCALES: { code: SupportedLocale; label: string }[] = [
  { code: "en", label: "EN · English" },
  { code: "es", label: "ES · Español" },
  { code: "fr", label: "FR · Français" },
  { code: "it", label: "IT · Italiano" },
];

export function LanguageSelect({ className = "" }: LanguageSelectProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`relative inline-flex items-center text-xs font-mono text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer ${className}`}
    >
      <GlobeIcon className="size-3.5 mr-1 text-gray-400 shrink-0 pointer-events-none" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as SupportedLocale)}
        aria-label="Select language"
        className="appearance-none bg-transparent py-1 pl-0.5 pr-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-0 focus:outline-hidden text-current"
      >
        {LOCALES.map((loc) => (
          <option
            key={loc.code}
            value={loc.code}
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-sans text-xs py-1"
          >
            {loc.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="size-3 -ml-3 pointer-events-none opacity-40 shrink-0" />
    </div>
  );
}

export default LanguageSelect;
