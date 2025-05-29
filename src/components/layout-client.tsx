"use client";

import { useSelector, useDispatch } from "react-redux";
import { selectLocale, setLocale } from "@/store/redux-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-switcher";
import { Locale } from "@/lib/i18n";

export function LayoutClient() {
  const dispatch = useDispatch();
  const locale = useSelector(selectLocale);

  const handleLocaleChange = (newLocale: Locale) => {
    dispatch(setLocale(newLocale));
  };

  return (
    <div className="flex items-center space-x-3">
      <LanguageToggle
        currentLocale={locale}
        onLocaleChange={handleLocaleChange}
      />
      <ThemeToggle />
    </div>
  );
}
