import {
  configureStore,
  createSlice,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { BankAccount, Transaction, LoadingState, FilterState, Currency } from "@/types";
import { Locale, defaultLocale } from "@/lib/i18n";

// Helper functions for date conversion
export const dateToISOString = (date: Date): string => date.toISOString();
export const isoStringToDate = (isoString: string): Date => new Date(isoString);

// Mock exchange rates (in a real app, this would come from an API)
const exchangeRates: Record<Currency, Record<Currency, number>> = {
  USD: { USD: 1, EUR: 0.85, GBP: 0.73, CHF: 0.88, CNY: 6.95, SEK: 9.50, NOK: 9.20, DKK: 6.30, PLN: 4.10, CZK: 22.50, HUF: 350 },
  EUR: { USD: 1.18, EUR: 1, GBP: 0.86, CHF: 1.04, CNY: 8.20, SEK: 11.20, NOK: 10.85, DKK: 7.44, PLN: 4.83, CZK: 26.50, HUF: 412 },
  GBP: { USD: 1.37, EUR: 1.16, GBP: 1, CHF: 1.21, CNY: 9.52, SEK: 13.02, NOK: 12.61, DKK: 8.64, PLN: 5.61, CZK: 30.80, HUF: 479 },
  CHF: { USD: 1.13, EUR: 0.96, GBP: 0.83, CHF: 1, CNY: 7.88, SEK: 10.77, NOK: 10.43, DKK: 7.16, PLN: 4.65, CZK: 25.56, HUF: 398 },
  CNY: { USD: 0.14, EUR: 0.12, GBP: 0.11, CHF: 0.13, CNY: 1, SEK: 1.37, NOK: 1.32, DKK: 0.91, PLN: 0.59, CZK: 3.24, HUF: 50.4 },
  SEK: { USD: 0.11, EUR: 0.09, GBP: 0.08, CHF: 0.09, CNY: 0.73, SEK: 1, NOK: 0.97, DKK: 0.66, PLN: 0.43, CZK: 2.37, HUF: 36.8 },
  NOK: { USD: 0.11, EUR: 0.09, GBP: 0.08, CHF: 0.10, CNY: 0.76, SEK: 1.03, NOK: 1, DKK: 0.68, PLN: 0.45, CZK: 2.45, HUF: 38.0 },
  DKK: { USD: 0.16, EUR: 0.13, GBP: 0.12, CHF: 0.14, CNY: 1.10, SEK: 1.51, NOK: 1.46, DKK: 1, PLN: 0.65, CZK: 3.57, HUF: 55.6 },
  PLN: { USD: 0.24, EUR: 0.21, GBP: 0.18, CHF: 0.22, CNY: 1.69, SEK: 2.32, NOK: 2.24, DKK: 1.54, PLN: 1, CZK: 5.49, HUF: 85.4 },
  CZK: { USD: 0.04, EUR: 0.04, GBP: 0.03, CHF: 0.04, CNY: 0.31, SEK: 0.42, NOK: 0.41, DKK: 0.28, PLN: 0.18, CZK: 1, HUF: 15.6 },
  HUF: { USD: 0.003, EUR: 0.002, GBP: 0.002, CHF: 0.003, CNY: 0.020, SEK: 0.027, NOK: 0.026, DKK: 0.018, PLN: 0.012, CZK: 0.064, HUF: 1 }
};

// Currency conversion function
export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  const rate = exchangeRates[fromCurrency]?.[toCurrency] ?? 1;
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
};

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
  defaultCurrency: Currency;
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
  defaultCurrency: "USD" as Currency,
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
    setDefaultCurrency: (state, action: PayloadAction<Currency>) => {
      state.defaultCurrency = action.payload;
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
  setDefaultCurrency,
} = bankSlice.actions;

// Selectors
export const selectAccounts = (state: RootState) => state.bank.accounts;
export const selectTransactions = (state: RootState) => state.bank.transactions;
export const selectLoading = (state: RootState) => state.bank.loading;
export const selectFilters = (state: RootState) => state.bank.filters;
export const selectError = (state: RootState) => state.bank.error;
export const selectLocale = (state: RootState) => state.bank.locale;
export const selectDefaultCurrency = (state: RootState) => state.bank.defaultCurrency;

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

// Currency-converted total balance
export const selectTotalBalanceInCurrency = createSelector(
  [selectAccounts, selectDefaultCurrency],
  (accounts, defaultCurrency) => {
    return accounts
      .filter((account) => account.isActive)
      .reduce((total, account) => {
        const convertedBalance = convertCurrency(account.balance, account.currency, defaultCurrency);
        return total + convertedBalance;
      }, 0);
  }
);

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

export const selectFilteredAccountsWithDates = createSelector(
  [selectFilteredAccounts],
  (accounts) => accounts.map(deserializeAccount)
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
