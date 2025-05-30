/**
 * @jest-environment node
 */

/**
 * MSW Integration Test
 * Verifies that MSW handlers are working correctly
 */

import { setupServer } from 'msw/node';
import { handlers } from '@/lib/msw/handlers';
import { mockAccounts } from '@/lib/mock-data';

// Create MSW server for testing
const server = setupServer(...handlers);

// Base URL for testing
const BASE_URL = 'http://localhost:3000';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

describe('MSW Integration', () => {
  it('should intercept GET /api/accounts requests', async () => {
    const response = await fetch(`${BASE_URL}/api/accounts`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.message).toContain('Found');
  });

  it('should intercept POST /api/accounts requests', async () => {
    const newAccount = {
      ownerId: "999999",
      accountHolder: 'Test User',
      accountType: 'checking',
      initialBalance: 1000,
      currency: 'USD',
    };

    const response = await fetch(`${BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccount),
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.accountHolder).toBe('Test User');
    expect(data.data.ownerId).toBe("999999");
    expect(data.message).toBe('Account created successfully');
  });

  it('should intercept GET /api/accounts/:id requests', async () => {
    // Use the first mock account ID
    const accountId = mockAccounts[0]?.id;
    expect(accountId).toBeDefined();

    const response = await fetch(`${BASE_URL}/api/accounts/${accountId}`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(accountId);
    expect(data.message).toBe('Account retrieved successfully');
  });

  it('should handle 404 for non-existent accounts', async () => {
    const response = await fetch(`${BASE_URL}/api/accounts/non-existent-id`);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Account not found');
  });

  it('should intercept GET /api/transactions requests', async () => {
    const response = await fetch(`${BASE_URL}/api/transactions`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.message).toBe('Transactions retrieved successfully');
  });

  it('should intercept POST /api/transfers requests', async () => {
    const transferData = {
      fromAccountId: '1',
      toAccountId: '2',
      amount: 100,
      description: 'Test transfer',
      type: 'transfer'
    };

    const response = await fetch(`${BASE_URL}/api/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferData)
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.fromAccountId).toBe(transferData.fromAccountId);
    expect(data.data.toAccountId).toBe(transferData.toAccountId);
    expect(data.data.amount).toBe(transferData.amount);
  });

  it('should handle currency mismatch in transfers', async () => {
    // Create two accounts with different currencies
    const account1Data = {
      ownerId: "555555",
      accountHolder: 'USD Account Holder',
      accountType: 'checking',
      initialBalance: 1000,
      currency: 'USD'
    };

    const account2Data = {
      ownerId: "666666",
      accountHolder: 'EUR Account Holder',
      accountType: 'savings',
      initialBalance: 800,
      currency: 'EUR'
    };

    // Create first account
    const response1 = await fetch(`${BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account1Data)
    });
    const account1 = await response1.json();

    // Create second account
    const response2 = await fetch(`${BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account2Data)
    });
    const account2 = await response2.json();

    // Attempt transfer between different currencies
    const transferData = {
      fromAccountId: account1.data.id,
      toAccountId: account2.data.id,
      amount: 100,
      description: 'Cross-currency transfer',
      type: 'transfer',
      exchangeRate: 0.85,
      convertedAmount: 85,
      sourceCurrency: 'USD',
      targetCurrency: 'EUR'
    };

    const transferResponse = await fetch(`${BASE_URL}/api/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferData)
    });

    expect(transferResponse.status).toBe(201);
    const transferResult = await transferResponse.json();
    expect(transferResult.success).toBe(true);
    expect(transferResult.data.exchangeRate).toBe(0.85);
    expect(transferResult.data.convertedAmount).toBe(85);
  });

  it('should prevent deleting account with positive balance', async () => {
    // Create an account with positive balance
    const accountData = {
      ownerId: "777777",
      accountHolder: 'Test Account Holder',
      accountType: 'checking',
      initialBalance: 500,
      currency: 'USD'
    };

    const createResponse = await fetch(`${BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    const account = await createResponse.json();

    // Attempt to delete account with balance
    const deleteResponse = await fetch(`${BASE_URL}/api/accounts/${account.data.id}`, {
      method: 'DELETE'
    });

    expect(deleteResponse.status).toBe(400);
    const deleteResult = await deleteResponse.json();
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain('positive balance');
  });

  it('should allow deleting account with zero balance', async () => {
    // Create an account with zero balance
    const accountData = {
      ownerId: "888888",
      accountHolder: 'Zero Balance Account',
      accountType: 'savings',
      initialBalance: 0,
      currency: 'USD'
    };

    const createResponse = await fetch(`${BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    const account = await createResponse.json();

    // Delete account with zero balance
    const deleteResponse = await fetch(`${BASE_URL}/api/accounts/${account.data.id}`, {
      method: 'DELETE'
    });

    expect(deleteResponse.status).toBe(200);
    const deleteResult = await deleteResponse.json();
    expect(deleteResult.success).toBe(true);
  });
}); 