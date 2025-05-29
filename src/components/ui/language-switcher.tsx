"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Languages, Check } from "lucide-react";

interface LanguageToggleProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
}

// Supported languages with their flag emojis and native names
const languages = {
  en: { flag: "🇺🇸", name: "English", nativeName: "English" },
  es: { flag: "🇪🇸", name: "Spanish", nativeName: "Español" },
  fr: { flag: "🇫🇷", name: "French", nativeName: "Français" },
  de: { flag: "🇩🇪", name: "German", nativeName: "Deutsch" },
};

export function LanguageToggle({
  currentLocale,
  onLocaleChange,
}: LanguageToggleProps) {
  const { t } = useTranslation();
  const currentLanguage = languages[currentLocale as keyof typeof languages] || languages.en;

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Languages className="h-4 w-4" />
                <span className="sr-only">{t("language")}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-medium">
              {t("language")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(languages).map(([locale, { flag, name, nativeName }]) => (
              <DropdownMenuItem
                key={locale}
                onClick={() => onLocaleChange(locale)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" role="img" aria-label={`${name} flag`}>
                    {flag}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{nativeName}</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </div>
                </div>
                {currentLocale === locale && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{t("language")}: {currentLanguage.nativeName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Legacy export for backward compatibility
export const LanguageSwitcher = LanguageToggle;
