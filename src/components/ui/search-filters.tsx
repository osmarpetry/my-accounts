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
  RotateCcw,
  Settings
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
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for E2E testing
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false); // Advanced filters collapsed by default
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

  const hasAdvancedFilters = searchCriteria.ownerId || 
    searchCriteria.minBalance !== undefined || 
    searchCriteria.maxBalance !== undefined;

  const activeFilterCount = Object.values(searchCriteria).filter(value => 
    value !== undefined && value !== ""
  ).length;

  return (
    <Card className="w-full" data-testid="search-filters-card">
      <CardHeader className="pb-3 mobile-card-padding">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Search className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">{t("search")} & {t("filters")}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 flex-shrink-0" data-testid="active-filter-count">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {resultCount !== undefined && totalCount !== undefined && (
              <span className="text-sm text-muted-foreground mobile-text-responsive" data-testid="results-count">
                <span className="hidden sm:inline">
                  {resultCount === totalCount 
                    ? `${totalCount} accounts`
                    : `${resultCount} of ${totalCount} accounts`
                  }
                </span>
                <span className="sm:hidden">
                  {resultCount}/{totalCount}
                </span>
              </span>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 mobile-touch-target" 
                  data-testid="filters-toggle"
                >
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
      
      <CardContent className="space-y-4 mobile-card-padding pt-0">
        {/* Main Search - Full Width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchByName")}
            value={searchCriteria.query || ""}
            onChange={(e) => updateCriteria({ query: e.target.value || undefined })}
            className="pl-10 pr-10 mobile-touch-target"
            data-testid="search-input"
          />
          {searchCriteria.query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 mobile-touch-target"
              onClick={() => clearField('query')}
              data-testid="clear-search-button"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Quick Filters Row */}
            <div className="mobile-filters-grid">
              {/* Account Type Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 mobile-text-responsive">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t("accountType")}</span>
                </Label>
                <Select
                  value={searchCriteria.accountType || ""}
                  onValueChange={(value) => 
                    updateCriteria({ accountType: value as AccountType || undefined })
                  }
                  data-testid="account-type-filter"
                >
                  <SelectTrigger data-testid="account-type-select" className="mobile-touch-target">
                    <SelectValue placeholder={t("filterByType")}>
                      {searchCriteria.accountType && (() => {
                        const selectedType = accountTypes.find(type => type.value === searchCriteria.accountType);
                        return selectedType ? (
                          <div className="flex items-center gap-2">
                            <selectedType.icon className="h-4 w-4" />
                            <span>{t(selectedType.value)}</span>
                          </div>
                        ) : null;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent data-testid="account-type-options">
                    <SelectItem value="" data-testid="account-type-option-all">All Types</SelectItem>
                    {accountTypes.map(({ value, icon: Icon }) => (
                      <SelectItem key={value} value={value} data-testid={`account-type-option-${value}`}>
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
                <Label className="flex items-center gap-2 mobile-text-responsive">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t("currency")}</span>
                </Label>
                <Select
                  value={searchCriteria.currency || ""}
                  onValueChange={(value) => 
                    updateCriteria({ currency: value as Currency || undefined })
                  }
                  data-testid="currency-filter"
                >
                  <SelectTrigger data-testid="currency-select" className="mobile-touch-target">
                    <SelectValue placeholder={t("filterByCurrency")}>
                      {searchCriteria.currency && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{getCurrencySymbol(searchCriteria.currency)}</span>
                          <span>{searchCriteria.currency}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent data-testid="currency-options">
                    <SelectItem value="" data-testid="currency-option-all">All Currencies</SelectItem>
                    {supportedCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency} data-testid={`currency-option-${currency}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm w-6">{getCurrencySymbol(currency)}</span>
                          <span className="font-medium">{currency}</span>
                          <span className="text-muted-foreground text-sm hidden sm:inline">
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
                <Label className="flex items-center gap-2 mobile-text-responsive">
                  <Hash className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t("status")}</span>
                </Label>
                <Select
                  value={searchCriteria.isActive !== undefined ? searchCriteria.isActive.toString() : ""}
                  onValueChange={(value) => 
                    updateCriteria({ 
                      isActive: value === "" ? undefined : value === "true" 
                    })
                  }
                  data-testid="status-filter"
                >
                  <SelectTrigger data-testid="status-select" className="mobile-touch-target">
                    <SelectValue placeholder={t("filterByStatus")}>
                      {searchCriteria.isActive !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${searchCriteria.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span>{searchCriteria.isActive ? t("active") : t("inactive")}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent data-testid="status-options">
                    <SelectItem value="" data-testid="status-option-all">All Status</SelectItem>
                    <SelectItem value="true" data-testid="status-option-active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>{t("active")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="false" data-testid="status-option-inactive">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span>{t("inactive")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters Collapsible Section */}
            <div className="pt-2">
              <Collapsible open={isAdvancedExpanded} onOpenChange={setIsAdvancedExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-2 h-auto mobile-touch-target"
                    data-testid="advanced-filters-toggle"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">{t("advancedFilters")}</span>
                      {hasAdvancedFilters && (
                        <Badge variant="secondary" className="ml-2">
                          {[searchCriteria.ownerId, searchCriteria.minBalance, searchCriteria.maxBalance].filter(Boolean).length}
                        </Badge>
                      )}
                    </div>
                    {isAdvancedExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mobile-advanced-filters pt-3">
                  <div className="space-y-4 border-t pt-4">
                    {/* Owner ID Filter */}
                    <div className="space-y-2">
                      <Label htmlFor="owner-id-filter" className="flex items-center gap-2 mobile-text-responsive">
                        <Hash className="h-4 w-4 flex-shrink-0" />
                        <span>{t("ownerId")}</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="owner-id-filter"
                          placeholder={t("filterByOwnerId")}
                          value={searchCriteria.ownerId || ""}
                          onChange={(e) => updateCriteria({ ownerId: e.target.value || undefined })}
                          className="pr-8 mobile-touch-target"
                          data-testid="owner-id-filter"
                        />
                        {searchCriteria.ownerId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 mobile-touch-target"
                            onClick={() => clearField('ownerId')}
                            data-testid="clear-owner-id-button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Balance Range Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min-balance-filter" className="flex items-center gap-2 mobile-text-responsive">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span>{t("minBalance")}</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="min-balance-filter"
                            type="number"
                            placeholder="0.00"
                            value={searchCriteria.minBalance || ""}
                            onChange={(e) => updateCriteria({ 
                              minBalance: e.target.value ? parseFloat(e.target.value) : undefined 
                            })}
                            className="pr-8 mobile-touch-target"
                            data-testid="min-balance-filter"
                          />
                          {searchCriteria.minBalance !== undefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 mobile-touch-target"
                              onClick={() => clearField('minBalance')}
                              data-testid="clear-min-balance-button"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-balance-filter" className="flex items-center gap-2 mobile-text-responsive">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span>{t("maxBalance")}</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="max-balance-filter"
                            type="number"
                            placeholder="999999.99"
                            value={searchCriteria.maxBalance || ""}
                            onChange={(e) => updateCriteria({ 
                              maxBalance: e.target.value ? parseFloat(e.target.value) : undefined 
                            })}
                            className="pr-8 mobile-touch-target"
                            data-testid="max-balance-filter"
                          />
                          {searchCriteria.maxBalance !== undefined && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 mobile-touch-target"
                              onClick={() => clearField('maxBalance')}
                              data-testid="clear-max-balance-button"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Action Buttons */}
            {(hasActiveFilters || searchCriteria.query) && (
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="flex items-center gap-2 mobile-action-button mobile-touch-target"
                        data-testid="clear-all-filters-button"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>{t("clearAllFilters")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("resetAllSearchAndFilterCriteria")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex-1 sm:flex-none">
                  <div className="text-sm text-muted-foreground text-center sm:text-left mobile-text-responsive">
                    {activeFilterCount > 0 && (
                      <span>
                        {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export type { SortOption }; 