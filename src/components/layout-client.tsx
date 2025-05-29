"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { selectDefaultCurrency, setLocale, setDefaultCurrency } from "@/store/redux-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-switcher";
import { CurrencyToggle } from "@/components/ui/currency-switcher";
import { Currency } from "@/types";
import { Locale } from "@/lib/i18n";

export function LayoutClient() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const defaultCurrency = useSelector(selectDefaultCurrency);

  const handleLocaleChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    dispatch(setLocale(newLocale as Locale));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    dispatch(setDefaultCurrency(newCurrency));
    // Store currency preference in localStorage
    localStorage.setItem('defaultCurrency', newCurrency);
  };

  // Load currency preference on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('defaultCurrency') as Currency;
    if (savedCurrency && savedCurrency !== defaultCurrency) {
      dispatch(setDefaultCurrency(savedCurrency));
    }
  }, [dispatch, defaultCurrency]);

  return (
    <div className="flex items-center space-x-3">
      <CurrencyToggle
        currentCurrency={defaultCurrency}
        onCurrencyChange={handleCurrencyChange}
      />
      <LanguageToggle
        currentLocale={i18n.language}
        onLocaleChange={handleLocaleChange}
      />
      <ThemeToggle />
    </div>
  );
}
