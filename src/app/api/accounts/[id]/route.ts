import { NextRequest, NextResponse } from "next/server";
import { updateAccountSchema } from "@/lib/validations";
import { BankAccount, ApiResponse } from "@/types";

// Import the same accounts array from the main route
// In production, this would be from a database
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    const { id } = await params;
    const account = accounts.find((acc) => acc.id === id);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: account,
      message: "Account retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch account",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validation = updateAccountSchema.safeParse(body);

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

    const accountIndex = accounts.findIndex((acc) => acc.id === id);

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      );
    }

    // Update the account
    const currentAccount = accounts[accountIndex]!;

    const updatedAccount: BankAccount = {
      ...currentAccount,
      updatedAt: new Date().toISOString(),
    };

    // Apply updates only for defined values
    if (validation.data.accountHolder !== undefined) {
      updatedAccount.accountHolder = validation.data.accountHolder;
    }
    if (validation.data.isActive !== undefined) {
      updatedAccount.isActive = validation.data.isActive;
    }

    accounts[accountIndex] = updatedAccount;

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update account",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    const { id } = await params;
    const accountIndex = accounts.findIndex((acc) => acc.id === id);

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      );
    }

    // Remove the account
    accounts.splice(accountIndex, 1);

    return NextResponse.json({
      success: true,
      data: null,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete account",
      },
      { status: 500 }
    );
  }
}
