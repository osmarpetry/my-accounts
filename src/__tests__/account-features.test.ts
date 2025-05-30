/**
 * Tests for new account page features and bug fixes
 */

import { searchAccounts, sortAccounts } from '@/lib/utils';
import { BankAccount, SearchCriteria, AccountType, Currency } from '@/types';

// Mock accounts data for testing
const mockAccounts: BankAccount[] = [
  {
    id: '1',
    accountNumber: '1234567890',
    accountHolder: 'Alice Johnson',
    accountType: 'checking' as AccountType,
    balance: 1500.50,
    currency: 'USD' as Currency,
    isActive: true,
    ownerId: '123456',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    accountNumber: '0987654321',
    accountHolder: 'Bob Smith',
    accountType: 'savings' as AccountType,
    balance: 2500.00,
    currency: 'EUR' as Currency,
    isActive: true,
    ownerId: '234567',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    accountNumber: '1122334455',
    accountHolder: 'Charlie Brown',
    accountType: 'credit' as AccountType,
    balance: 0,
    currency: 'GBP' as Currency,
    isActive: false,
    ownerId: '345678',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '4',
    accountNumber: '5566778899',
    accountHolder: 'Diana Prince',
    accountType: 'checking' as AccountType,
    balance: 750.25,
    currency: 'USD' as Currency,
    isActive: true,
    ownerId: '456789',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

describe('Account Page Features', () => {
  describe('Sorting Functionality', () => {
    test('should sort accounts by updatedAt descending (recently updated first)', () => {
      const sorted = sortAccounts(mockAccounts, 'updatedAt_desc');
      expect(sorted[0]!.accountHolder).toBe('Diana Prince'); // Jan 25
      expect(sorted[1]!.accountHolder).toBe('Bob Smith');    // Jan 20
      expect(sorted[2]!.accountHolder).toBe('Alice Johnson'); // Jan 15
      expect(sorted[3]!.accountHolder).toBe('Charlie Brown'); // Jan 10
    });

    test('should sort accounts by balance descending (highest first)', () => {
      const sorted = sortAccounts(mockAccounts, 'balance_desc');
      expect(sorted[0]!.balance).toBe(2500.00); // Bob
      expect(sorted[1]!.balance).toBe(1500.50); // Alice
      expect(sorted[2]!.balance).toBe(750.25);  // Diana
      expect(sorted[3]!.balance).toBe(0);       // Charlie
    });

    test('should sort accounts by name A-Z', () => {
      const sorted = sortAccounts(mockAccounts, 'accountHolder_asc');
      expect(sorted[0]!.accountHolder).toBe('Alice Johnson');
      expect(sorted[1]!.accountHolder).toBe('Bob Smith');
      expect(sorted[2]!.accountHolder).toBe('Charlie Brown');
      expect(sorted[3]!.accountHolder).toBe('Diana Prince');
    });
  });

  describe('Search and Filter Functionality', () => {
    test('should search accounts by account holder name', () => {
      const criteria: SearchCriteria = { query: 'Alice' };
      const filtered = searchAccounts(mockAccounts, criteria);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.accountHolder).toBe('Alice Johnson');
    });

    test('should filter accounts by account type', () => {
      const criteria: SearchCriteria = { accountType: 'checking' };
      const filtered = searchAccounts(mockAccounts, criteria);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(acc => acc.accountType === 'checking')).toBe(true);
    });

    test('should filter accounts by currency', () => {
      const criteria: SearchCriteria = { currency: 'USD' };
      const filtered = searchAccounts(mockAccounts, criteria);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(acc => acc.currency === 'USD')).toBe(true);
    });
  });

  describe('Account Deletion Validation', () => {
    test('should identify accounts with positive balance', () => {
      const accountWithBalance = mockAccounts.find(acc => acc.balance > 0);
      expect(accountWithBalance).toBeDefined();
      expect(accountWithBalance!.balance).toBeGreaterThan(0);
    });

    test('should identify accounts with zero balance', () => {
      const accountWithoutBalance = mockAccounts.find(acc => acc.balance === 0);
      expect(accountWithoutBalance).toBeDefined();
      expect(accountWithoutBalance!.balance).toBe(0);
    });

    test('should validate account deletion eligibility', () => {
      const canDelete = (account: BankAccount) => account.balance === 0;
      
      const eligibleAccounts = mockAccounts.filter(canDelete);
      const ineligibleAccounts = mockAccounts.filter(acc => !canDelete(acc));
      
      expect(eligibleAccounts).toHaveLength(1);
      expect(ineligibleAccounts).toHaveLength(3);
      expect(eligibleAccounts[0]!.accountHolder).toBe('Charlie Brown');
    });
  });
}); 