import {
  configureStore,
  createSlice,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { BankAccount, Transaction, LoadingState, FilterState } from "@/types";
import { Locale, defaultLocale } from "@/lib/i18n";

// Helper functions for date conversion
export const dateToISOString = (date: Date): string => date.toISOString();
export const isoStringToDate = (isoString: string): Date => new Date(isoString);

// Helper function to convert accounts with Date objects to serializable format
export const serializeAccount = (
  account:
    | BankAccount
    | (Omit<BankAccount, "createdAt" | "updatedAt"> & {
        createdAt: Date | string;
        updatedAt: Date | string;
      })
): BankAccount => ({
  ...account,
  createdAt:
    typeof account.createdAt === "object"
      ? account.createdAt.toISOString()
      : account.createdAt,
  updatedAt:
    typeof account.updatedAt === "object"
      ? account.updatedAt.toISOString()
      : account.updatedAt,
});

// Helper function to convert accounts from serializable format to Date objects for UI
export const deserializeAccount = (account: BankAccount) => ({
  ...account,
  createdAt: new Date(account.createdAt),
  updatedAt: new Date(account.updatedAt),
});

interface BankState {
  accounts: BankAccount[];
  transactions: Transaction[];
  loading: LoadingState;
  filters: FilterState;
  error: string | null;
  locale: Locale;
}

const initialState: BankState = {
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
  locale: defaultLocale,
};

const bankSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {
    // Account actions
    setAccounts: (state, action: PayloadAction<BankAccount[]>) => {
      // Ensure all dates are stored as ISO strings
      state.accounts = action.payload.map(serializeAccount);
    },
    addAccount: (state, action: PayloadAction<BankAccount>) => {
      // Ensure dates are stored as ISO strings
      state.accounts.push(serializeAccount(action.payload));
    },
    updateAccount: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<BankAccount> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.accounts.findIndex((account) => account.id === id);
      if (index !== -1 && state.accounts[index]) {
        const account = state.accounts[index];
        if (updates.accountHolder !== undefined)
          account.accountHolder = updates.accountHolder;
        if (updates.isActive !== undefined) account.isActive = updates.isActive;
        if (updates.balance !== undefined) account.balance = updates.balance;
        if (updates.currency !== undefined) account.currency = updates.currency;
        if (updates.accountType !== undefined)
          account.accountType = updates.accountType;
        if (updates.updatedAt !== undefined) {
          account.updatedAt =
            typeof updates.updatedAt === "object"
              ? (updates.updatedAt as Date).toISOString()
              : (updates.updatedAt as string);
        } else {
          account.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(
        (account) => account.id !== action.payload
      );
    },

    // Transaction actions
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      // Ensure all dates are stored as ISO strings
      state.transactions = action.payload.map((transaction) => ({
        ...transaction,
        createdAt:
          typeof transaction.createdAt === "object"
            ? (transaction.createdAt as Date).toISOString()
            : transaction.createdAt,
      }));
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      // Ensure dates are stored as ISO strings
      state.transactions.push({
        ...action.payload,
        createdAt:
          typeof action.payload.createdAt === "object"
            ? (action.payload.createdAt as Date).toISOString()
            : action.payload.createdAt,
      });
    },

    // UI actions
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof LoadingState; value: boolean }>
    ) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    },
  },
});

export const {
  setAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  setTransactions,
  addTransaction,
  setLoading,
  setFilters,
  setError,
  clearError,
  setLocale,
} = bankSlice.actions;

// Selectors
export const selectAccounts = (state: RootState) => state.bank.accounts;
export const selectTransactions = (state: RootState) => state.bank.transactions;
export const selectLoading = (state: RootState) => state.bank.loading;
export const selectFilters = (state: RootState) => state.bank.filters;
export const selectError = (state: RootState) => state.bank.error;
export const selectLocale = (state: RootState) => state.bank.locale;

// Selectors that return data with Date objects for UI consumption
export const selectAccountsWithDates = createSelector(
  [selectAccounts],
  (accounts) => accounts.map(deserializeAccount)
);

export const selectTransactionsWithDates = createSelector(
  [selectTransactions],
  (transactions) =>
    transactions.map((transaction) => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt),
    }))
);

// Computed selectors
export const selectTotalBalance = (state: RootState) => {
  return state.bank.accounts
    .filter((account) => account.isActive)
    .reduce((total, account) => total + account.balance, 0);
};

export const selectAccountById = (accountId: string) => (state: RootState) => {
  return state.bank.accounts.find((account) => account.id === accountId);
};

export const selectFilteredAccounts = createSelector(
  [selectAccounts, selectFilters],
  (accounts, filters) => {
    return accounts.filter((account) => {
      if (filters.accountType && account.accountType !== filters.accountType) {
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
  }
);

export const selectAccountTransactions = (accountId: string) =>
  createSelector([selectTransactions], (transactions) =>
    transactions
      .filter((transaction) => transaction.accountId === accountId)
      .map((transaction) => ({
        ...transaction,
        createdAt: new Date(transaction.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

export const store = configureStore({
  reducer: {
    bank: bankSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
