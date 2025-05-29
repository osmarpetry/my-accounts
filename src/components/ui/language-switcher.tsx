"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locale, locales, useTranslation } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

// Flag emoji components
const FlagIcon = ({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) => {
  const flags = {
    en: "🇺🇸", // US flag
    fr: "🇫🇷", // French flag
  };

  return (
    <span className={className} role="img" aria-label={`${locale} flag`}>
      {flags[locale]}
    </span>
  );
};

export function LanguageSwitcher({
  currentLocale,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const languageNames = {
    en: "English",
    fr: "Français",
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentLocale}
        onValueChange={(value) => onLocaleChange(value as Locale)}
      >
        <SelectTrigger className="w-auto min-w-[120px] gap-2">
          <div className="flex items-center gap-2">
            <FlagIcon locale={currentLocale} />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              <div className="flex items-center gap-2">
                <FlagIcon locale={locale} />
                <span>{languageNames[locale]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Simplified toggle button version
export function LanguageToggle({
  currentLocale,
  onLocaleChange,
}: LanguageSwitcherProps) {
  const { t } = useTranslation(currentLocale);

  const toggleLocale = () => {
    const newLocale = currentLocale === "en" ? "fr" : "en";
    onLocaleChange(newLocale);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center gap-2"
      title={t("nav.switchLanguage")}
    >
      <FlagIcon locale={currentLocale} />
      <span className="hidden sm:inline">
        {currentLocale === "en" ? "EN" : "FR"}
      </span>
    </Button>
  );
}
