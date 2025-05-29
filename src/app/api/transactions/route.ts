import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createTransactionSchema } from "@/lib/validations";
import { Transaction, ApiResponse } from "@/types";

// In-memory storage for demo purposes
const transactions: Transaction[] = [
  {
    id: "1",
    accountId: "1",
    type: "deposit",
    amount: 1000,
    description: "Initial deposit",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "2",
    accountId: "2",
    type: "deposit",
    amount: 5000,
    description: "Salary deposit",
    createdAt: new Date("2024-01-10").toISOString(),
  },
];

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Transaction[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    let filteredTransactions = transactions;

    if (accountId) {
      filteredTransactions = transactions.filter(
        (t) => t.accountId === accountId
      );
    }

    // Sort by creation date (newest first)
    filteredTransactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredTransactions,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const body = await request.json();

    // Validate the request body
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          message: validation.error.errors[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { accountId, type, amount, description, toAccountId } =
      validation.data;

    // Create new transaction
    const newTransaction: Transaction = {
      id: uuidv4(),
      accountId,
      type,
      amount,
      description,
      createdAt: new Date().toISOString(),
      ...(toAccountId && { toAccountId }),
    };

    transactions.push(newTransaction);

    return NextResponse.json(
      {
        success: true,
        data: newTransaction,
        message: "Transaction created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create transaction",
      },
      { status: 500 }
    );
  }
}
