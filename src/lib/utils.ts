import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency, BankAccount, SearchCriteria } from "@/types";

/**
 * Combines and merges Tailwind CSS classes with proper precedence
 * This is a best practice for conditional styling in 2025
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mock exchange rates - in production, these would come from a real API like xe.com or fixer.io
 * Base currency is USD - all rates are relative to 1 USD
 * Rates updated as of 2025 (following market trends)
 */
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,      // US Dollar (base)
  EUR: 0.85,     // Euro
  GBP: 0.73,     // British Pound
  CHF: 0.92,     // Swiss Franc
  CNY: 6.45,     // Chinese Yuan (Renminbi)
  SEK: 10.50,    // Swedish Krona
  NOK: 10.80,    // Norwegian Krone
  DKK: 6.35,     // Danish Krone
  PLN: 4.25,     // Polish Zloty
  CZK: 23.50,    // Czech Koruna
  HUF: 380.00,   // Hungarian Forint
};

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  CNY: "¥",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
};

/**
 * Currency names for display
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
};

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(EXCHANGE_RATES) as Currency[];
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
  }
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return 1;
  
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency pair: ${fromCurrency}/${toCurrency}`);
  }
  
  return toRate / fromRate;
}

/**
 * Check if two currencies are different
 */
export function isDifferentCurrency(currency1: Currency, currency2: Currency): boolean {
  return currency1 !== currency2;
}

/**
 * Format currency with proper symbol and locale
 */
export function formatCurrencyWithSymbol(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // Handle different currency formatting conventions
  switch (currency) {
    case "EUR":
      return `${amount.toFixed(2)} €`;
    case "SEK":
    case "NOK":
    case "DKK":
      return `${amount.toFixed(2)} ${symbol}`;
    case "PLN":
      return `${amount.toFixed(2)} ${symbol}`;
    case "CZK":
      return `${amount.toFixed(2)} ${symbol}`;
    case "HUF":
      return `${Math.round(amount)} ${symbol}`;
    default:
      return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency] || currency;
}

/**
 * Formats currency with proper locale support (backward compatibility)
 */
export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  return formatCurrencyWithSymbol(amount, currency);
}

/**
 * Formats date with relative time
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Generates a random account number
 */
export function generateAccountNumber(): string {
  return Math.random().toString().slice(2, 12);
}

/**
 * Generate a random owner ID
 */
export function generateOwnerId(): number {
  return Math.floor(Math.random() * 900000) + 100000; // 6-digit number
}

/**
 * Search and filter accounts based on criteria
 */
export function searchAccounts(accounts: BankAccount[], criteria: SearchCriteria): BankAccount[] {
  return accounts.filter((account) => {
    // Text search across multiple fields
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      const searchableText = [
        account.accountHolder,
        account.accountNumber,
        account.id,
        account.ownerId.toString(),
        account.currency,
        account.accountType,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Currency filter
    if (criteria.currency && account.currency !== criteria.currency) {
      return false;
    }

    // Account type filter
    if (criteria.accountType && account.accountType !== criteria.accountType) {
      return false;
    }

    // Owner ID filter
    if (criteria.ownerId && account.ownerId !== criteria.ownerId) {
      return false;
    }

    // Active status filter
    if (criteria.isActive !== undefined && account.isActive !== criteria.isActive) {
      return false;
    }

    // Balance range filters
    if (criteria.minBalance !== undefined && account.balance < criteria.minBalance) {
      return false;
    }

    if (criteria.maxBalance !== undefined && account.balance > criteria.maxBalance) {
      return false;
    }

    return true;
  });
}

/**
 * Validate sufficient balance for transfer
 */
export function validateTransferBalance(fromAccount: BankAccount, amount: number): boolean {
  return fromAccount.balance >= amount && amount > 0;
}

/**
 * Calculate currency conversion preview
 */
export function getCurrencyConversionPreview(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
) {
  if (fromCurrency === toCurrency) {
    return {
      sourceAmount: amount,
      targetAmount: amount,
      exchangeRate: 1,
      isDifferent: false,
    };
  }

  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);

  return {
    sourceAmount: amount,
    targetAmount: convertedAmount,
    exchangeRate,
    isDifferent: true,
  };
}

/**
 * Sort accounts based on criteria
 */
export function sortAccounts<T extends BankAccount>(accounts: T[], sortBy: string): T[] {
  const sortedAccounts = [...accounts];
  
  switch (sortBy) {
    case "updatedAt_desc":
      return sortedAccounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "updatedAt_asc":
      return sortedAccounts.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case "createdAt_desc":
      return sortedAccounts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "createdAt_asc":
      return sortedAccounts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "accountHolder_asc":
      return sortedAccounts.sort((a, b) => a.accountHolder.localeCompare(b.accountHolder));
    case "accountHolder_desc":
      return sortedAccounts.sort((a, b) => b.accountHolder.localeCompare(a.accountHolder));
    case "balance_desc":
      return sortedAccounts.sort((a, b) => b.balance - a.balance);
    case "balance_asc":
      return sortedAccounts.sort((a, b) => a.balance - b.balance);
    default:
      // Default to recently updated first
      return sortedAccounts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}
