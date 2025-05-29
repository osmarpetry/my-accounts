import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from "uuid";
import { createAccountSchema, searchCriteriaSchema, updateAccountSchema } from "@/lib/validations";
import { BankAccount } from "@/types";
import { generateAccountNumber, searchAccounts } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock-data";

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const accountsHandlers = [
  // GET /api/accounts - List and search accounts
  http.get('*/api/accounts', async ({ request }) => {
    try {
      // Add 1 second delay to show loading states
      await delay(1000);

      // Get search and filter parameters from URL
      const url = new URL(request.url);
      const searchParams = Object.fromEntries(url.searchParams.entries());

      // Validate search criteria
      const searchCriteria = searchCriteriaSchema.safeParse(searchParams);
      if (!searchCriteria.success) {
        return HttpResponse.json(
          {
            success: false,
            error: "Invalid search criteria",
            details: searchCriteria.error.errors,
          },
          { status: 400 }
        );
      }

      // Filter accounts based on search criteria
      const filteredAccounts = searchAccounts(mockAccounts, searchCriteria.data);

      return HttpResponse.json({
        success: true,
        data: filteredAccounts,
        message: `Found ${filteredAccounts.length} account(s)`,
        total: filteredAccounts.length,
      });
    } catch (error) {
      console.error("Error in GET /api/accounts:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // POST /api/accounts - Create new account
  http.post('*/api/accounts', async ({ request }) => {
    try {
      // Add delay for demonstration
      await delay(500);

      const body = await request.json();

      // Validate request body
      const validation = createAccountSchema.safeParse(body);
      if (!validation.success) {
        return HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const { ownerId, accountHolder, accountType, initialBalance, currency } = validation.data;

      // Check if account holder already exists for this owner
      const existingAccount = mockAccounts.find(
        (account) =>
          account.ownerId === ownerId &&
          account.accountHolder.toLowerCase() === accountHolder.toLowerCase()
      );

      if (existingAccount) {
        return HttpResponse.json(
          {
            success: false,
            error: "Account holder already exists for this owner",
          },
          { status: 409 }
        );
      }

      // Create new account
      const newAccount: BankAccount = {
        id: uuidv4(),
        accountNumber: generateAccountNumber(),
        accountType,
        accountHolder,
        balance: initialBalance,
        currency,
        isActive: true,
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock data (in real app, this would be saved to database)
      mockAccounts.push(newAccount);

      return HttpResponse.json(
        {
          success: true,
          data: newAccount,
          message: "Account created successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error in POST /api/accounts:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // GET /api/accounts/[id] - Get specific account
  http.get('*/api/accounts/:id', async ({ params }) => {
    try {
      await delay(300);

      const { id } = params;
      const account = mockAccounts.find((acc) => acc.id === id);

      if (!account) {
        return HttpResponse.json(
          {
            success: false,
            error: "Account not found",
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        data: account,
        message: "Account retrieved successfully",
      });
    } catch (error) {
      console.error("Error in GET /api/accounts/[id]:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // PUT /api/accounts/[id] - Update account
  http.put('*/api/accounts/:id', async ({ params, request }) => {
    try {
      await delay(500);

      const { id } = params;
      const body = await request.json();

      // Find account
      const accountIndex = mockAccounts.findIndex((acc) => acc.id === id);
      if (accountIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Account not found",
          },
          { status: 404 }
        );
      }

      // Validate request body
      const validation = updateAccountSchema.safeParse(body);
      if (!validation.success) {
        return HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const updateData = validation.data;

      // Check if trying to update account holder to an existing one
      if (updateData.accountHolder) {
        const existingAccount = mockAccounts.find(
          (account) =>
            account.id !== id &&
            account.ownerId === mockAccounts[accountIndex]!.ownerId &&
            account.accountHolder.toLowerCase() === updateData.accountHolder!.toLowerCase()
        );

        if (existingAccount) {
          return HttpResponse.json(
            {
              success: false,
              error: "Account holder already exists for this owner",
            },
            { status: 409 }
          );
        }
      }

      // Update account
      const currentAccount = mockAccounts[accountIndex]!;
      const updatedAccount: BankAccount = {
        ...currentAccount,
        ...(updateData.accountHolder !== undefined && { accountHolder: updateData.accountHolder }),
        ...(updateData.balance !== undefined && { balance: updateData.balance }),
        ...(updateData.currency !== undefined && { currency: updateData.currency }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        updatedAt: new Date().toISOString(),
      };

      mockAccounts[accountIndex] = updatedAccount;

      return HttpResponse.json({
        success: true,
        data: updatedAccount,
        message: "Account updated successfully",
      });
    } catch (error) {
      console.error("Error in PUT /api/accounts/[id]:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // DELETE /api/accounts/[id] - Delete account
  http.delete('*/api/accounts/:id', async ({ params }) => {
    try {
      await delay(500);

      const { id } = params;
      const accountIndex = mockAccounts.findIndex((acc) => acc.id === id);

      if (accountIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Account not found",
          },
          { status: 404 }
        );
      }

      const account = mockAccounts[accountIndex]!;

      // Check if account has balance
      if (account.balance > 0) {
        return HttpResponse.json(
          {
            success: false,
            error: "Cannot delete account with positive balance",
          },
          { status: 400 }
        );
      }

      // Remove account from mock data
      mockAccounts.splice(accountIndex, 1);

      return HttpResponse.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Error in DELETE /api/accounts/[id]:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),
]; 