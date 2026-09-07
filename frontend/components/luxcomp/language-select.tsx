"use client";

import React from "react";
import { useLanguage, SupportedLocale } from "@/hooks/use-language";
import { GlobeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSelectProps {
  variant?: "header" | "footer" | "sidebar" | "compact";
  className?: string;
}

const LOCALES: { code: SupportedLocale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "it", label: "Italiano", short: "IT" },
];

export function LanguageSelect({ variant = "header", className }: LanguageSelectProps) {
  const { lang, setLang } = useLanguage();

  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        isSidebar ? "w-full" : "",
        className
      )}
    >
      <GlobeIcon
        className={cn(
          "shrink-0 text-muted-foreground",
          isSidebar ? "size-4" : "size-3.5"
        )}
      />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as SupportedLocale)}
        aria-label="Select language"
        className={cn(
          "appearance-none bg-transparent border-0 focus:outline-none cursor-pointer",
          "text-foreground font-medium tracking-wide",
          "transition-colors hover:text-foreground/80",
          isSidebar
            ? "text-sm w-full py-0.5"
            : "text-xs font-mono uppercase py-0"
        )}
      >
        {LOCALES.map((loc) => (
          <option
            key={loc.code}
            value={loc.code}
            className="bg-background text-foreground text-xs"
          >
            {isSidebar ? `${loc.short} — ${loc.label}` : loc.short}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelect;
