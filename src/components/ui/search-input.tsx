"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value?: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export function SearchInput({
  value = "",
  onSearchChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  disabled = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Debounce the search function
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      const timeoutId = setTimeout(() => {
        if (!disabled) {
          onSearchChange(searchValue);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [onSearchChange, debounceMs, disabled]
  );

  // Effect to handle debounced search
  useEffect(() => {
    const cleanup = debouncedSearch(internalValue);
    return cleanup;
  }, [internalValue, debouncedSearch]);

  // Sync external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue("");
    onSearchChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="pl-10 pr-10"
          autoComplete="off"
          role="searchbox"
          aria-label={placeholder}
        />
        {internalValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
} 