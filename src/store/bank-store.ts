import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BankAccount, Transaction, LoadingState, FilterState } from "@/types";

interface BankStore {
  // State
  accounts: BankAccount[];
  transactions: Transaction[];
  loading: LoadingState;
  filters: FilterState;
  error: string | null;

  // Account actions
  setAccounts: (accounts: BankAccount[]) => void;
  addAccount: (account: BankAccount) => void;
  updateAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;

  // Transaction actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;

  // UI actions
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed values
  getTotalBalance: () => number;
  getAccountById: (id: string) => BankAccount | undefined;
  getFilteredAccounts: () => BankAccount[];
  getAccountTransactions: (accountId: string) => Transaction[];
}

export const useBankStore = create<BankStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      accounts: [],
      transactions: [],
      loading: {
        accounts: false,
        transactions: false,
        createAccount: false,
        createTransaction: false,
      },
      filters: {},
      error: null,

      // Account actions
      setAccounts: (accounts) => set({ accounts }, false, "setAccounts"),

      addAccount: (account) =>
        set(
          (state) => ({ accounts: [...state.accounts, account] }),
          false,
          "addAccount"
        ),

      updateAccount: (id, updates) =>
        set(
          (state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id ? { ...account, ...updates } : account
            ),
          }),
          false,
          "updateAccount"
        ),

      deleteAccount: (id) =>
        set(
          (state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
          }),
          false,
          "deleteAccount"
        ),

      // Transaction actions
      setTransactions: (transactions) =>
        set({ transactions }, false, "setTransactions"),

      addTransaction: (transaction) =>
        set(
          (state) => ({ transactions: [...state.transactions, transaction] }),
          false,
          "addTransaction"
        ),

      // UI actions
      setLoading: (key, value) =>
        set(
          (state) => ({
            loading: { ...state.loading, [key]: value },
          }),
          false,
          "setLoading"
        ),

      setFilters: (filters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          "setFilters"
        ),

      setError: (error) => set({ error }, false, "setError"),

      clearError: () => set({ error: null }, false, "clearError"),

      // Computed values
      getTotalBalance: () => {
        const { accounts } = get();
        return accounts
          .filter((account) => account.isActive)
          .reduce((total, account) => total + account.balance, 0);
      },

      getAccountById: (id) => {
        const { accounts } = get();
        return accounts.find((account) => account.id === id);
      },

      getFilteredAccounts: () => {
        const { accounts, filters } = get();
        return accounts.filter((account) => {
          if (
            filters.accountType &&
            account.accountType !== filters.accountType
          ) {
            return false;
          }
          if (
            filters.isActive !== undefined &&
            account.isActive !== filters.isActive
          ) {
            return false;
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
              account.accountHolder.toLowerCase().includes(searchLower) ||
              account.accountNumber.includes(searchLower)
            );
          }
          return true;
        });
      },

      getAccountTransactions: (accountId) => {
        const { transactions } = get();
        return transactions
          .filter((transaction) => transaction.accountId === accountId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },
    }),
    {
      name: "bank-store",
    }
  )
);
