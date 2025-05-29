/**
 * Core types for the Bank Accounts Management System
 * Following TypeScript best practices for 2025
 */

export type AccountType = "checking" | "savings" | "credit";

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: AccountType;
  accountHolder: string;
  balance: number;
  currency: string;
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
  accountHolder: string;
  accountType: AccountType;
  initialBalance?: number;
  currency?: string;
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
}
