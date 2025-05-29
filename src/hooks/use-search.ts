"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface UseSearchOptions {
  debounceMs?: number;
  searchParam?: string;
  onSearchChange?: (searchTerm: string) => void;
}

interface UseSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
}

export function useSearch({
  debounceMs = 300,
  searchParam = "search",
  onSearchChange,
}: UseSearchOptions = {}): UseSearchReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize search term from URL params
  const [searchTerm, setSearchTermState] = useState(
    searchParams.get(searchParam) || ""
  );
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      onSearchChange?.(searchTerm);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setIsSearching(false);
      onSearchChange?.(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debounceMs, onSearchChange]);

  // Update URL params when search term changes
  const updateURLParams = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term.trim()) {
        params.set(searchParam, term);
      } else {
        params.delete(searchParam);
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams, searchParam]
  );

  const setSearchTerm = useCallback(
    (term: string) => {
      setSearchTermState(term);
      updateURLParams(term);
    },
    [updateURLParams]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, [setSearchTerm]);

  // Sync with URL params changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get(searchParam) || "";
    if (urlSearchTerm !== searchTerm) {
      setSearchTermState(urlSearchTerm);
    }
  }, [searchParams, searchParam, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    isSearching,
  };
} 