import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createAccountSchema } from "@/lib/validations";
import { BankAccount, ApiResponse } from "@/types";
import { generateAccountNumber } from "@/lib/utils";

// In-memory storage for demo purposes
// In production, this would be a database
const accounts: BankAccount[] = [
  {
    id: "1",
    accountNumber: "1234567890",
    accountType: "checking",
    accountHolder: "John Doe",
    balance: 5000,
    currency: "USD",
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    accountNumber: "0987654321",
    accountType: "savings",
    accountHolder: "Jane Smith",
    balance: 15000,
    currency: "USD",
    isActive: true,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
];

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(): Promise<NextResponse<ApiResponse<BankAccount[]>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    return NextResponse.json({
      success: true,
      data: accounts,
      message: "Accounts retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch accounts",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    const body = await request.json();

    // Validate the request body
    const validation = createAccountSchema.safeParse(body);

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

    const { accountHolder, accountType, initialBalance, currency } =
      validation.data;

    // Create new account
    const newAccount: BankAccount = {
      id: uuidv4(),
      accountNumber: generateAccountNumber(),
      accountType,
      accountHolder,
      balance: initialBalance,
      currency,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);

    return NextResponse.json(
      {
        success: true,
        data: newAccount,
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create account",
      },
      { status: 500 }
    );
  }
}
