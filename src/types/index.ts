/**
 * Core types for the Bank Accounts Management System
 * Following TypeScript best practices for 2025
 */

export type AccountType = "checking" | "savings" | "credit";

// Supported currencies: Chinese Yuan, European currencies, and US Dollar
export type Currency = "USD" | "EUR" | "GBP" | "CHF" | "CNY" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF";

export interface BankAccount {
  id: string;
  ownerId: number; // Numeric owner ID (minimal requirement)
  accountNumber: string;
  accountType: AccountType;
  accountHolder: string;
  balance: number; // Numeric balance (minimal requirement)
  currency: Currency; // String currency (minimal requirement)
  isActive: boolean;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

export interface Transaction {
  id: string;
  accountId: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  description: string;
  createdAt: string; // ISO string for Redux serialization
  fromAccountId?: string;
  toAccountId?: string;
  // Currency conversion fields for cross-currency transfers
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: Currency;
  convertedAmount?: number;
  convertedCurrency?: Currency;
}

// UI helper types that convert ISO strings to Date objects
export interface BankAccountWithDates
  extends Omit<BankAccount, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithDates extends Omit<Transaction, "createdAt"> {
  createdAt: Date;
}

export interface CreateAccountInput {
  ownerId: number; // Required numeric owner ID
  accountHolder: string;
  accountType: AccountType;
  initialBalance?: number;
  currency?: Currency;
}

export interface UpdateAccountInput {
  accountHolder?: string;
  isActive?: boolean;
}

export interface CreateTransactionInput {
  accountId: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  description: string;
  toAccountId?: string;
  // Currency conversion data
  exchangeRate?: number;
  convertedAmount?: number;
  sourceCurrency?: Currency;
  targetCurrency?: Currency;
}

// Transfer-specific type for cross-currency transfers
export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  type: "transfer";
  // Optional currency conversion fields
  exchangeRate?: number;
  convertedAmount?: number;
  sourceCurrency?: Currency;
  targetCurrency?: Currency;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// UI State types
export interface LoadingState {
  accounts: boolean;
  transactions: boolean;
  createAccount: boolean;
  createTransaction: boolean;
}

export interface FilterState {
  accountType?: AccountType;
  isActive?: boolean;
  search?: string;
  currency?: Currency;
  ownerId?: number;
}

// Search functionality types
export interface SearchCriteria {
  query?: string | undefined;
  currency?: Currency | undefined;
  accountType?: AccountType | undefined;
  ownerId?: number | undefined;
  isActive?: boolean | undefined;
  minBalance?: number | undefined;
  maxBalance?: number | undefined;
}

// Currency conversion utilities
export interface CurrencyConversion {
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: string;
}
