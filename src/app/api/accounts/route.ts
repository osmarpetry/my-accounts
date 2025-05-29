import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createAccountSchema, searchCriteriaSchema } from "@/lib/validations";
import { BankAccount, ApiResponse } from "@/types";
import { generateAccountNumber, searchAccounts } from "@/lib/utils";
import { mockAccounts } from "@/lib/mock-data";

// Helper function to add delay for demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<BankAccount[]>>> {
  try {
    // Add 1 second delay to show loading states
    await delay(1000);

    // Get search and filter parameters from URL
    const searchParams = request.nextUrl.searchParams;
    
    // Build search criteria from query parameters
    const searchCriteria: any = {};
    
    const query = searchParams.get("search");
    if (query) searchCriteria.query = query;
    
    const currency = searchParams.get("currency");
    if (currency) searchCriteria.currency = currency;
    
    const accountType = searchParams.get("accountType");
    if (accountType) searchCriteria.accountType = accountType;
    
    const ownerIdParam = searchParams.get("ownerId");
    if (ownerIdParam) searchCriteria.ownerId = parseInt(ownerIdParam);
    
    const isActiveParam = searchParams.get("isActive");
    if (isActiveParam) searchCriteria.isActive = isActiveParam === "true";
    
    const minBalanceParam = searchParams.get("minBalance");
    if (minBalanceParam) searchCriteria.minBalance = parseFloat(minBalanceParam);
    
    const maxBalanceParam = searchParams.get("maxBalance");
    if (maxBalanceParam) searchCriteria.maxBalance = parseFloat(maxBalanceParam);

    // Validate search criteria
    const validation = searchCriteriaSchema.safeParse(searchCriteria);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search criteria",
          message: validation.error.errors[0]?.message || "Invalid parameters",
        },
        { status: 400 }
      );
    }

    // Use the enhanced search function
    const filteredAccounts = searchAccounts(mockAccounts, validation.data);

    return NextResponse.json({
      success: true,
      data: filteredAccounts,
      message: `Found ${filteredAccounts.length} account(s)`,
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

    const { ownerId, accountHolder, accountType, initialBalance, currency } =
      validation.data;

    // Check for duplicate owner ID
    const existingAccountWithOwnerId = mockAccounts.find(
      (account) => account.ownerId === ownerId
    );

    if (existingAccountWithOwnerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Owner ID already exists",
          message: `An account with owner ID ${ownerId} already exists`,
        },
        { status: 400 }
      );
    }

    // Check for duplicate account holder name
    const existingAccountWithName = mockAccounts.find(
      (account) => account.accountHolder.toLowerCase() === accountHolder.toLowerCase()
    );

    if (existingAccountWithName) {
      return NextResponse.json(
        {
          success: false,
          error: "Account holder name already exists",
          message: "An account with this holder name already exists",
        },
        { status: 400 }
      );
    }

    // Create new account
    const newAccount: BankAccount = {
      id: uuidv4(),
      ownerId,
      accountNumber: generateAccountNumber(),
      accountType,
      accountHolder,
      balance: initialBalance,
      currency,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAccounts.push(newAccount);

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
