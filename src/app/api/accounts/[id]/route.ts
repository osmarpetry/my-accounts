import { NextRequest, NextResponse } from "next/server";
import { updateAccountSchema } from "@/lib/validations";
import { BankAccount, ApiResponse } from "@/types";
import { mockAccounts } from "@/lib/mock-data";

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    await delay(500);
    const { id } = await params;

    const account = mockAccounts.find((acc) => acc.id === id);

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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    await delay(1000);
    const { id } = await params;

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === id);

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      );
    }

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

    const existingAccount = mockAccounts[accountIndex]!;
    const { accountHolder, balance, currency, isActive } = validation.data;

    // Business logic validation
    if (isActive === false && (balance ?? existingAccount.balance) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot deactivate account with positive balance",
          message: "Please transfer the remaining balance before deactivating the account",
        },
        { status: 400 }
      );
    }

    // Check if account holder name is being changed to an existing one
    if (accountHolder && accountHolder !== existingAccount.accountHolder) {
      const duplicateAccount = mockAccounts.find(
        (acc) => acc.accountHolder.toLowerCase() === accountHolder.toLowerCase() && acc.id !== id
      );
      
      if (duplicateAccount) {
        return NextResponse.json(
          {
            success: false,
            error: "Account holder name already exists",
            message: "An account with this holder name already exists",
          },
          { status: 400 }
        );
      }
    }

    // Update the account
    const updatedAccount: BankAccount = {
      ...existingAccount,
      ...(accountHolder !== undefined && { accountHolder }),
      ...(balance !== undefined && { balance }),
      ...(currency !== undefined && { currency }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString(),
    };

    mockAccounts[accountIndex] = updatedAccount;

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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await delay(1000);
    const { id } = await params;

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === id);

    if (accountIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found",
        },
        { status: 404 }
      );
    }

    const account = mockAccounts[accountIndex]!;

    // Business logic validation
    if (account.balance > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete account with positive balance",
          message: "Please transfer the remaining balance before deleting the account",
        },
        { status: 400 }
      );
    }

    if (account.balance < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete account with negative balance",
          message: "Please resolve the negative balance before deleting the account",
        },
        { status: 400 }
      );
    }

    // Remove the account
    mockAccounts.splice(accountIndex, 1);

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
