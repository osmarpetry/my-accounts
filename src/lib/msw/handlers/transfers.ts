import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/types";
import { BankAccount } from "@/types";
import { mockAccounts, mockTransactions } from "@/lib/mock-data";

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  type: "transfer";
  exchangeRate?: number;
  convertedAmount?: number;
  sourceCurrency?: string;
  targetCurrency?: string;
}

export const transfersHandlers = [
  // GET /api/transfers - List transfers/transactions
  http.get('*/api/transfers', async () => {
    try {
      // This returns transfer-type transactions from the mockTransactions array
      const transferTransactions = mockTransactions.filter(
        transaction => transaction.type === "transfer" || 
        (transaction.fromAccountId && transaction.toAccountId)
      );

      // Sort by creation date (newest first)
      transferTransactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return HttpResponse.json({
        success: true,
        data: transferTransactions,
        message: "Transfers retrieved successfully",
      });
    } catch (error) {
      console.error("Error in GET /api/transfers:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  }),

  // POST /api/transfers - Create transfer between accounts
  http.post('*/api/transfers', async ({ request }) => {
    try {
      // Add 1 second delay to show loading states
      await delay(1000);

      const body = await request.json() as TransferRequest;
      const { fromAccountId, toAccountId, amount, description } = body;

      // Validation
      if (!fromAccountId || !toAccountId || !amount || !description) {
        return HttpResponse.json(
          {
            success: false,
            error: "Missing required fields",
          },
          { status: 400 }
        );
      }

      if (fromAccountId === toAccountId) {
        return HttpResponse.json(
          {
            success: false,
            error: "Cannot transfer to the same account",
          },
          { status: 400 }
        );
      }

      if (amount <= 0) {
        return HttpResponse.json(
          {
            success: false,
            error: "Transfer amount must be greater than zero",
          },
          { status: 400 }
        );
      }

      if (amount > 100000) {
        return HttpResponse.json(
          {
            success: false,
            error: "Transfer amount cannot exceed $100,000",
          },
          { status: 400 }
        );
      }

      // Find accounts
      const fromAccountIndex = mockAccounts.findIndex(acc => acc.id === fromAccountId);
      const toAccountIndex = mockAccounts.findIndex(acc => acc.id === toAccountId);

      if (fromAccountIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Source account not found",
          },
          { status: 404 }
        );
      }

      if (toAccountIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Destination account not found",
          },
          { status: 404 }
        );
      }

      const fromAccount = mockAccounts[fromAccountIndex]!;
      const toAccount = mockAccounts[toAccountIndex]!;

      // Check if accounts are active
      if (!fromAccount.isActive) {
        return HttpResponse.json(
          {
            success: false,
            error: "Source account is not active",
          },
          { status: 400 }
        );
      }

      if (!toAccount.isActive) {
        return HttpResponse.json(
          {
            success: false,
            error: "Destination account is not active",
          },
          { status: 400 }
        );
      }

      // Check if source account has sufficient balance
      if (fromAccount.balance < amount) {
        return HttpResponse.json(
          {
            success: false,
            error: "Insufficient funds in source account",
          },
          { status: 400 }
        );
      }

      // Check currency compatibility and handle conversion
      if (fromAccount.currency !== toAccount.currency) {
        // Check if exchange rate data is provided for currency conversion
        const { exchangeRate, convertedAmount, sourceCurrency, targetCurrency } = body as TransferRequest;
        
        if (!exchangeRate || !convertedAmount || !sourceCurrency || !targetCurrency) {
          return HttpResponse.json(
            {
              success: false,
              error: "Currency mismatch between accounts. Please provide exchange rate and converted amount for cross-currency transfers.",
            },
            { status: 400 }
          );
        }

        if (sourceCurrency !== fromAccount.currency || targetCurrency !== toAccount.currency) {
          return HttpResponse.json(
            {
              success: false,
              error: "Source and target currencies do not match account currencies",
            },
            { status: 400 }
          );
        }

        // Use converted amount for destination account
        const actualToAmount = convertedAmount;

        // Perform the transfer with currency conversion
        const now = new Date().toISOString();

        // Create withdrawal transaction for source account (original amount)
        const withdrawalTransaction: Transaction = {
          id: uuidv4(),
          accountId: fromAccountId,
          type: "withdrawal",
          amount: amount,
          description: `Transfer to ${toAccount.accountHolder} - ${description} (${sourceCurrency} to ${targetCurrency})`,
          createdAt: now,
          fromAccountId: fromAccountId,
          toAccountId: toAccountId,
        };

        // Create deposit transaction for destination account (converted amount)
        const depositTransaction: Transaction = {
          id: uuidv4(),
          accountId: toAccountId,
          type: "deposit",
          amount: actualToAmount,
          description: `Transfer from ${fromAccount.accountHolder} - ${description} (${sourceCurrency} to ${targetCurrency})`,
          createdAt: now,
          fromAccountId: fromAccountId,
          toAccountId: toAccountId,
        };

        // Update account balances
        const updatedFromAccount: BankAccount = {
          ...fromAccount,
          balance: fromAccount.balance - amount,
          updatedAt: now,
        };

        const updatedToAccount: BankAccount = {
          ...toAccount,
          balance: toAccount.balance + actualToAmount,
          updatedAt: now,
        };

        mockAccounts[fromAccountIndex] = updatedFromAccount;
        mockAccounts[toAccountIndex] = updatedToAccount;

        // Store transactions
        mockTransactions.push(withdrawalTransaction, depositTransaction);

        return HttpResponse.json(
          {
            success: true,
            data: {
              fromTransaction: withdrawalTransaction,
              toTransaction: depositTransaction,
              fromAccount: updatedFromAccount,
              toAccount: updatedToAccount,
              exchangeRate,
              convertedAmount: actualToAmount,
              fromAccountId,
              toAccountId,
              amount,
            },
            message: "Cross-currency transfer completed successfully",
          },
          { status: 201 }
        );
      }

      // Perform the transfer (atomic operation simulation)
      const now = new Date().toISOString();

      // Create withdrawal transaction for source account
      const withdrawalTransaction: Transaction = {
        id: uuidv4(),
        accountId: fromAccountId,
        type: "withdrawal",
        amount: amount,
        description: `Transfer to ${toAccount.accountHolder} - ${description}`,
        createdAt: now,
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
      };

      // Create deposit transaction for destination account
      const depositTransaction: Transaction = {
        id: uuidv4(),
        accountId: toAccountId,
        type: "deposit",
        amount: amount,
        description: `Transfer from ${fromAccount.accountHolder} - ${description}`,
        createdAt: now,
        fromAccountId: fromAccountId,
        toAccountId: toAccountId,
      };

      // Update account balances
      const updatedFromAccount: BankAccount = {
        ...fromAccount,
        balance: fromAccount.balance - amount,
        updatedAt: now,
      };

      const updatedToAccount: BankAccount = {
        ...toAccount,
        balance: toAccount.balance + amount,
        updatedAt: now,
      };

      mockAccounts[fromAccountIndex] = updatedFromAccount;
      mockAccounts[toAccountIndex] = updatedToAccount;

      // Store transactions
      mockTransactions.push(withdrawalTransaction, depositTransaction);

      return HttpResponse.json(
        {
          success: true,
          data: {
            fromTransaction: withdrawalTransaction,
            toTransaction: depositTransaction,
            fromAccount: updatedFromAccount,
            toAccount: updatedToAccount,
            fromAccountId,
            toAccountId,
            amount,
          },
          message: "Transfer completed successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error processing transfer:", error);
      return HttpResponse.json(
        {
          success: false,
          error: "Failed to process transfer",
        },
        { status: 500 }
      );
    }
  }),
]; 