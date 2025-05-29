import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse, Transaction } from "@/types";
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
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ 
  fromTransaction: Transaction;
  toTransaction: Transaction;
  fromAccount: BankAccount;
  toAccount: BankAccount;
}>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    const body: TransferRequest = await request.json();
    const { fromAccountId, toAccountId, amount, description } = body;

    // Validation
    if (!fromAccountId || !toAccountId || !amount || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot transfer to the same account",
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Transfer amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (amount > 100000) {
      return NextResponse.json(
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
      return NextResponse.json(
        {
          success: false,
          error: "Source account not found",
        },
        { status: 404 }
      );
    }

    if (toAccountIndex === -1) {
      return NextResponse.json(
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
      return NextResponse.json(
        {
          success: false,
          error: "Source account is not active",
        },
        { status: 400 }
      );
    }

    if (!toAccount.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Destination account is not active",
        },
        { status: 400 }
      );
    }

    // Check if source account has sufficient balance
    if (fromAccount.balance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient funds in source account",
        },
        { status: 400 }
      );
    }

    // Check currency compatibility (in a real app, you might handle conversions)
    if (fromAccount.currency !== toAccount.currency) {
      return NextResponse.json(
        {
          success: false,
          error: "Currency mismatch between accounts",
        },
        { status: 400 }
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

    return NextResponse.json(
      {
        success: true,
        data: {
          fromTransaction: withdrawalTransaction,
          toTransaction: depositTransaction,
          fromAccount: updatedFromAccount,
          toAccount: updatedToAccount,
        },
        message: "Transfer completed successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing transfer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process transfer",
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse<ApiResponse<Transaction[]>>> {
  try {
    await delay(1000);

    return NextResponse.json({
      success: true,
      data: mockTransactions,
      message: "Transfers retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transfers",
      },
      { status: 500 }
    );
  }
} 