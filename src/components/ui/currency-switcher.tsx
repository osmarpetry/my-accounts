"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Currency } from "@/types";
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
import { getCurrencySymbol, getCurrencyName, getSupportedCurrencies } from "@/lib/utils";
import { DollarSign, Check } from "lucide-react";

interface CurrencyToggleProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export function CurrencyToggle({
  currentCurrency,
  onCurrencyChange,
}: CurrencyToggleProps) {
  const { t } = useTranslation();
  const supportedCurrencies = getSupportedCurrencies();

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 min-w-[40px] px-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                <span className="font-medium text-sm">
                  {getCurrencySymbol(currentCurrency)}
                </span>
                <span className="sr-only">{t("defaultCurrency")}: {getCurrencyName(currentCurrency)}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-medium">
              {t("defaultCurrency")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {supportedCurrencies.map((currency) => (
              <DropdownMenuItem
                key={currency}
                onClick={() => onCurrencyChange(currency)}
                className="flex items-center justify-between cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {getCurrencySymbol(currency)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm">{currency}</span>
                    <span className="text-xs text-muted-foreground">
                      {getCurrencyName(currency)}
                    </span>
                  </div>
                </div>
                {currentCurrency === currency && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{t("defaultCurrency")}: {getCurrencyName(currentCurrency)} ({currentCurrency})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 