"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchCriteria, AccountType, Currency, SortOption } from "@/types";
import { 
  getSupportedCurrencies, 
  getCurrencySymbol, 
  getCurrencyName 
} from "@/lib/utils";
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  Wallet,
  Banknote,
  CreditCard,
  Building2,
  Hash,
  DollarSign,
  RotateCcw
} from "lucide-react";

interface SearchFiltersProps {
  searchCriteria: SearchCriteria;
  onSearchChange: (criteria: SearchCriteria) => void;
  onClearFilters: () => void;
  resultCount?: number;
  totalCount?: number;
}

const accountTypes: { value: AccountType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "checking", label: "Checking", icon: Wallet },
  { value: "savings", label: "Savings", icon: Banknote },
  { value: "credit", label: "Credit", icon: CreditCard },
];

export function SearchFilters({
  searchCriteria,
  onSearchChange,
  onClearFilters,
  resultCount,
  totalCount,
}: SearchFiltersProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const supportedCurrencies = getSupportedCurrencies();

  const updateCriteria = (updates: Partial<SearchCriteria>) => {
    onSearchChange({ ...searchCriteria, ...updates });
  };

  const clearField = (field: keyof SearchCriteria) => {
    const updated = { ...searchCriteria };
    delete updated[field];
    onSearchChange(updated);
  };

  const hasActiveFilters = Object.keys(searchCriteria).some(
    key => key !== 'query' && searchCriteria[key as keyof SearchCriteria] !== undefined
  );

  const activeFilterCount = Object.values(searchCriteria).filter(value => 
    value !== undefined && value !== ""
  ).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <span>{t("search")} & {t("filters")}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {resultCount !== undefined && totalCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {resultCount === totalCount 
                  ? `${totalCount} accounts`
                  : `${resultCount} of ${totalCount} accounts`
                }
              </span>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Search - Full Width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchByName")}
            value={searchCriteria.query || ""}
            onChange={(e) => updateCriteria({ query: e.target.value || undefined })}
            className="pl-10 pr-10"
          />
          {searchCriteria.query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => clearField('query')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Quick Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Account Type Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t("accountType")}
                </Label>
                <Select
                  value={searchCriteria.accountType || ""}
                  onValueChange={(value) => 
                    updateCriteria({ accountType: value as AccountType || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={t("filterByType")}
                      displayValue={searchCriteria.accountType ? (() => {
                        const selectedType = accountTypes.find(type => type.value === searchCriteria.accountType);
                        return selectedType ? (
                          <div className="flex items-center gap-2">
                            <selectedType.icon className="h-4 w-4" />
                            <span>{t(selectedType.value)}</span>
                          </div>
                        ) : undefined;
                      })() : undefined}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {accountTypes.map(({ value, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{t(value)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("currency")}
                </Label>
                <Select
                  value={searchCriteria.currency || ""}
                  onValueChange={(value) => 
                    updateCriteria({ currency: value as Currency || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={t("filterByCurrency")}
                      displayValue={searchCriteria.currency ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getCurrencySymbol(searchCriteria.currency)}
                          </span>
                          <span>{searchCriteria.currency}</span>
                          <span className="text-xs text-muted-foreground">
                            {getCurrencyName(searchCriteria.currency)}
                          </span>
                        </div>
                      ) : undefined}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Currencies</SelectItem>
                    {supportedCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getCurrencySymbol(currency)}
                          </span>
                          <span>{currency}</span>
                          <span className="text-xs text-muted-foreground">
                            {getCurrencyName(currency)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  value={searchCriteria.isActive?.toString() || ""}
                  onValueChange={(value) => 
                    updateCriteria({ 
                      isActive: value === "" ? undefined : value === "true" 
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={t("filterByStatus")}
                      displayValue={searchCriteria.isActive !== undefined ? (
                        searchCriteria.isActive ? t("active") : t("inactive")
                      ) : undefined}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="true">{t("active")}</SelectItem>
                    <SelectItem value="false">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
              {/* Owner ID Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t("ownerId")}
                </Label>
                <Input
                  type="text"
                  placeholder="000123"
                  value={searchCriteria.ownerId || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 6) {
                      updateCriteria({ 
                        ownerId: value || undefined 
                      });
                    }
                  }}
                  maxLength={6}
                />
              </div>

              {/* Min Balance Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("minBalance")}
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={searchCriteria.minBalance?.toString() || ""}
                  onChange={(e) => 
                    updateCriteria({ 
                      minBalance: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Balance Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("maxBalance")}
                </Label>
                <Input
                  type="number"
                  placeholder="1000000.00"
                  value={searchCriteria.maxBalance?.toString() || ""}
                  onChange={(e) => 
                    updateCriteria({ 
                      maxBalance: e.target.value ? parseFloat(e.target.value) : undefined 
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Active Filters & Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {searchCriteria.accountType && (
                    <Badge variant="secondary" className="gap-1">
                      Type: {t(searchCriteria.accountType)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => clearField('accountType')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {searchCriteria.currency && (
                    <Badge variant="secondary" className="gap-1">
                      {searchCriteria.currency}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => clearField('currency')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {searchCriteria.isActive !== undefined && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {searchCriteria.isActive ? t("active") : t("inactive")}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => clearField('isActive')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t("clearFilters")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all active filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export type { SortOption }; 