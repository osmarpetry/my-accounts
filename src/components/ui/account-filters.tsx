"use client";

import React from "react";
import { SearchInput } from "./search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Filter, RotateCcw } from "lucide-react";
import { FilterState, AccountType } from "@/types";
import { useTranslation, Locale } from "@/lib/i18n";

interface AccountFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  locale: Locale;
  accountsCount: number;
  filteredCount: number;
  className?: string;
}

const accountTypes: Array<{ value: AccountType; label: string }> = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit" },
];

export function AccountFilters({
  filters,
  onFiltersChange,
  locale,
  accountsCount,
  filteredCount,
  className,
}: AccountFiltersProps) {
  const { t } = useTranslation(locale);

  const handleSearchChange = (search: string) => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      onFiltersChange({ ...filters, search: trimmedSearch });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { search: _, ...otherFilters } = filters;
      onFiltersChange(otherFilters);
    }
  };

  const handleAccountTypeChange = (accountType: string) => {
    if (accountType === "all") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accountType: _, ...otherFilters } = filters;
      onFiltersChange(otherFilters);
    } else {
      onFiltersChange({ ...filters, accountType: accountType as AccountType });
    }
  };

  const handleActiveStatusChange = (status: string) => {
    if (status === "all") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isActive: _, ...otherFilters } = filters;
      onFiltersChange(otherFilters);
    } else {
      onFiltersChange({ ...filters, isActive: status === "active" });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.accountType || filters.isActive !== undefined
  );

  const getAccountTypeLabel = (type: AccountType) => {
    const accountType = accountTypes.find((t) => t.value === type);
    return accountType?.label || type;
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("filters.title")}</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("filters.clear")}
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label htmlFor="account-search" className="text-sm font-medium">
              {t("filters.search")}
            </label>
            <SearchInput
              value={filters.search || ""}
              onSearchChange={handleSearchChange}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Type Filter */}
            <div className="space-y-2">
              <label htmlFor="account-type-filter" className="text-sm font-medium">
                {t("filters.accountType")}
              </label>
              <Select
                value={filters.accountType || "all"}
                onValueChange={handleAccountTypeChange}
              >
                <SelectTrigger id="account-type-filter">
                  <SelectValue placeholder={t("filters.allTypes")}>
                    {filters.accountType ? 
                      getAccountTypeLabel(filters.accountType) : 
                      t("filters.allTypes")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Status Filter */}
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                {t("filters.status")}
              </label>
              <Select
                value={
                  filters.isActive === undefined
                    ? "all"
                    : filters.isActive
                    ? "active"
                    : "inactive"
                }
                onValueChange={handleActiveStatusChange}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder={t("filters.allStatuses")}>
                    {(() => {
                      if (filters.isActive === undefined) return t("filters.allStatuses");
                      return filters.isActive ? t("accounts.active") : t("accounts.inactive");
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("accounts.active")}</SelectItem>
                  <SelectItem value="inactive">{t("accounts.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <span className="text-sm font-medium">{t("filters.activeFilters")}:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("filters.search")}: &quot;{filters.search}&quot;
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSearchChange("")}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      aria-label="Remove search filter"
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {filters.accountType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("filters.type")}: {getAccountTypeLabel(filters.accountType)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAccountTypeChange("all")}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      aria-label="Remove account type filter"
                    >
                      ×
                    </Button>
                  </Badge>
                )}
                {filters.isActive !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {t("filters.status")}: {filters.isActive ? t("accounts.active") : t("accounts.inactive")}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleActiveStatusChange("all")}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      aria-label="Remove status filter"
                    >
                      ×
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredCount !== accountsCount ? (
              <>
                {t("filters.showingResults", {
                  filtered: filteredCount.toString(),
                  total: accountsCount.toString(),
                })}
              </>
            ) : (
              <>
                {t("filters.totalResults", {
                  total: accountsCount.toString(),
                })}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 