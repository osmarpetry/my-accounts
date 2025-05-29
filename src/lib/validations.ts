import { z } from "zod";

/**
 * Zod validation schemas for form validation and API endpoints
 * Following 2025 best practices for type-safe validation
 */

export const accountTypeSchema = z.enum(["checking", "savings", "credit"]);

export const createAccountSchema = z.object({
  accountHolder: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Account holder name can only contain letters and spaces"
    ),
  accountType: accountTypeSchema,
  initialBalance: z
    .number()
    .min(0, "Initial balance cannot be negative")
    .max(1000000, "Initial balance cannot exceed $1,000,000")
    .default(0),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code")
    .default("USD"),
});

export const updateAccountSchema = z.object({
  accountHolder: z
    .string()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Account holder name can only contain letters and spaces"
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  type: z.enum(["deposit", "withdrawal", "transfer"]),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100000, "Amount cannot exceed $100,000"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description cannot exceed 200 characters"),
  toAccountId: z.string().uuid("Invalid destination account ID").optional(),
});

export const filterSchema = z.object({
  accountType: accountTypeSchema.optional(),
  isActive: z.boolean().optional(),
  search: z
    .string()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),
});

// Type inference from schemas
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
