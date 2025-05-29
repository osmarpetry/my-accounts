import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from "uuid";
import { createTransactionSchema } from "@/lib/validations";
import { Transaction } from "@/types";
import { mockTransactions, mockAccounts } from "@/lib/mock-data";

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const transactionsHandlers = [
  // GET /api/transactions - List transactions
  http.get('*/api/transactions', async ({ request }) => {
    try {
      // Add delay for demonstration
      await delay(500);

      // Get query parameters
      const url = new URL(request.url);
      const accountId = url.searchParams.get('accountId');
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let filteredTransactions = [...mockTransactions];

      // Filter by account ID if provided
      if (accountId) {
        filteredTransactions = filteredTransactions.filter(
          transaction => 
            transaction.accountId === accountId ||
            transaction.fromAccountId === accountId ||
            transaction.toAccountId === accountId
        );
      }

      // Filter by type if provided
      if (type) {
        filteredTransactions = filteredTransactions.filter(
          transaction => transaction.type === type
        );
      }

      // Sort by creation date (newest first) and limit results
      filteredTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      if (limit > 0) {
        filteredTransactions = filteredTransactions.slice(0, limit);
      }

      return HttpResponse.json({
        success: true,
        data: filteredTransactions,
        message: 'Transactions retrieved successfully',
        total: filteredTransactions.length,
      });
    } catch (error) {
      console.error('Error in GET /api/transactions:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }),

  // POST /api/transactions - Create new transaction
  http.post('*/api/transactions', async ({ request }) => {
    try {
      // Add delay for demonstration
      await delay(500);

      const body = await request.json();

      // Validate request body
      const validation = createTransactionSchema.safeParse(body);
      if (!validation.success) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validation.error.errors,
          },
          { status: 400 }
        );
      }

      const { accountId, type, amount, description } = validation.data;

      // Find the account
      const account = mockAccounts.find(acc => acc.id === accountId);
      if (!account) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Account not found',
          },
          { status: 404 }
        );
      }

      // Check if account is active
      if (!account.isActive) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Cannot create transaction for inactive account',
          },
          { status: 400 }
        );
      }

      // For withdrawals, check if sufficient balance
      if (type === 'withdrawal' && account.balance < amount) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Insufficient balance',
          },
          { status: 400 }
        );
      }

      // Create new transaction
      const newTransaction: Transaction = {
        id: uuidv4(),
        accountId,
        type,
        amount,
        description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
        createdAt: new Date().toISOString(),
      };

      // Update account balance
      const accountIndex = mockAccounts.findIndex(acc => acc.id === accountId);
      if (accountIndex !== -1) {
        if (type === 'deposit') {
          mockAccounts[accountIndex]!.balance += amount;
        } else if (type === 'withdrawal') {
          mockAccounts[accountIndex]!.balance -= amount;
        }
        mockAccounts[accountIndex]!.updatedAt = new Date().toISOString();
      }

      // Add to mock data
      mockTransactions.push(newTransaction);

      return HttpResponse.json(
        {
          success: true,
          data: newTransaction,
          message: 'Transaction created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error in POST /api/transactions:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }),
]; 