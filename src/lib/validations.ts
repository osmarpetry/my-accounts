import { z } from "zod";

/**
 * Zod validation schemas for form validation and API endpoints
 * Following 2025 best practices for type-safe validation
 */

export const accountTypeSchema = z.enum(["checking", "savings", "credit"]);

// Supported currencies schema
export const currencySchema = z.enum([
  "USD", "EUR", "GBP", "CHF", "CNY", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF"
]);

export const createAccountSchema = z.object({
  ownerId: z
    .number()
    .int("Owner ID must be an integer")
    .min(100000, "Owner ID must be at least 6 digits")
    .max(999999, "Owner ID must be at most 6 digits"),
  accountHolder: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Account holder name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  accountType: accountTypeSchema,
  initialBalance: z
    .number()
    .min(0, "Initial balance cannot be negative")
    .max(1000000, "Initial balance cannot exceed 1,000,000")
    .default(0),
  currency: currencySchema.default("USD"),
});

export const updateAccountSchema = z.object({
  accountHolder: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Account holder name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),
  balance: z
    .number()
    .min(0, "Balance cannot be negative")
    .max(1000000, "Balance cannot exceed 1,000,000")
    .optional(),
  currency: currencySchema.optional(),
  isActive: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  type: z.enum(["deposit", "withdrawal", "transfer"]),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000, "Amount cannot exceed 100,000"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description cannot exceed 200 characters"),
  toAccountId: z.string().uuid("Invalid destination account ID").optional(),
});

// Transfer schema for cross-currency transfers
export const transferSchema = z.object({
  fromAccountId: z.string().uuid("Invalid source account ID"),
  toAccountId: z.string().uuid("Invalid destination account ID"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000, "Amount cannot exceed 100,000"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(200, "Description cannot exceed 200 characters"),
  type: z.literal("transfer"),
  // Optional currency conversion fields
  exchangeRate: z.number().positive().optional(),
  convertedAmount: z.number().positive().optional(),
  sourceCurrency: currencySchema.optional(),
  targetCurrency: currencySchema.optional(),
});

export const filterSchema = z.object({
  accountType: accountTypeSchema.optional(),
  isActive: z.boolean().optional(),
  search: z
    .string()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),
  currency: currencySchema.optional(),
  ownerId: z.number().int().positive().optional(),
});

// Search criteria schema
export const searchCriteriaSchema = z.object({
  query: z.string().max(100).optional(),
  currency: currencySchema.optional(),
  accountType: accountTypeSchema.optional(),
  ownerId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  minBalance: z.number().min(0).optional(),
  maxBalance: z.number().min(0).optional(),
});

// Type inference from schemas
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type SearchCriteriaInput = z.infer<typeof searchCriteriaSchema>;
