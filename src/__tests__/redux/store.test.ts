import { store } from "@/store/redux-store";
import {
  setAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  setLocale,
  selectAccounts,
  selectLocale,
  selectTotalBalance,
  selectAccountsWithDates,
} from "@/store/redux-store";
import { BankAccount } from "@/types";

describe("Redux Store", () => {
  const mockAccount: BankAccount = {
    id: "test-1",
    accountNumber: "1234567890",
    accountType: "checking",
    accountHolder: "Test User",
    balance: 1000,
    currency: "USD",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    // Reset store state
    store.dispatch(setAccounts([]));
    store.dispatch(setLocale("en")); // Reset locale to default
  });

  describe("Account Actions", () => {
    it("should add an account", () => {
      store.dispatch(addAccount(mockAccount));
      const state = store.getState();
      const accounts = selectAccounts(state);

      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toEqual(mockAccount);
      expect(typeof accounts[0]?.createdAt).toBe("string");
    });

    it("should update an account", () => {
      store.dispatch(addAccount(mockAccount));
      store.dispatch(
        updateAccount({
          id: "test-1",
          updates: { balance: 2000, accountHolder: "Updated User" },
        })
      );

      const state = store.getState();
      const accounts = selectAccounts(state);
      const updatedAccount = accounts[0];

      expect(updatedAccount?.balance).toBe(2000);
      expect(updatedAccount?.accountHolder).toBe("Updated User");
      expect(typeof updatedAccount?.updatedAt).toBe("string");
    });

    it("should delete an account", () => {
      store.dispatch(addAccount(mockAccount));
      store.dispatch(deleteAccount("test-1"));

      const state = store.getState();
      const accounts = selectAccounts(state);

      expect(accounts).toHaveLength(0);
    });

    it("should set multiple accounts", () => {
      const accounts = [mockAccount, { ...mockAccount, id: "test-2" }];
      store.dispatch(setAccounts(accounts));

      const state = store.getState();
      const storeAccounts = selectAccounts(state);

      expect(storeAccounts).toHaveLength(2);
    });
  });

  describe("Locale Management", () => {
    it("should set locale", () => {
      store.dispatch(setLocale("fr"));
      const state = store.getState();
      const locale = selectLocale(state);

      expect(locale).toBe("fr");
    });

    it("should default to English locale", () => {
      const state = store.getState();
      const locale = selectLocale(state);

      expect(locale).toBe("en");
    });
  });

  describe("Selectors", () => {
    beforeEach(() => {
      const accounts = [
        { ...mockAccount, balance: 1000, isActive: true },
        { ...mockAccount, id: "test-2", balance: 2000, isActive: true },
        { ...mockAccount, id: "test-3", balance: 500, isActive: false },
      ];
      store.dispatch(setAccounts(accounts));
    });

    it("should calculate total balance correctly", () => {
      const state = store.getState();
      const totalBalance = selectTotalBalance(state);

      expect(totalBalance).toBe(3000); // Only active accounts
    });

    it("should return accounts with Date objects", () => {
      const state = store.getState();
      const accountsWithDates = selectAccountsWithDates(state);

      expect(accountsWithDates[0]?.createdAt).toBeInstanceOf(Date);
      expect(accountsWithDates[0]?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Serialization", () => {
    it("should store dates as ISO strings", () => {
      const accountWithDateObjects: BankAccount = {
        ...mockAccount,
        createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
        updatedAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
      };

      store.dispatch(addAccount(accountWithDateObjects));
      const state = store.getState();
      const accounts = selectAccounts(state);

      expect(typeof accounts[0]?.createdAt).toBe("string");
      expect(typeof accounts[0]?.updatedAt).toBe("string");
      expect(accounts[0]?.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });
});
