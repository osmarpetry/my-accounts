"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  selectAccounts,
  selectLoading,
  selectError,
  selectTotalBalance,
  setAccounts,
  setLoading,
  setError,
  clearError,
  deleteAccount,
} from "@/store/redux-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountForm } from "@/components/forms/account-form";
import { TransferForm } from "@/components/forms/transfer-form";
import { SearchFilters } from "@/components/ui/search-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, searchAccounts, sortAccounts } from "@/lib/utils";
import {
  Plus,
  CreditCard,
  TrendingUp,
  Users,
  AlertCircle,
  Edit,
  Trash2,
  ArrowRightLeft,
  Wallet,
  PiggyBank,
  ArrowLeft,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { BankAccount, AccountType, SearchCriteria, SortOption, ViewMode } from "@/types";
import { useToast } from "@/components/ui/toast";

// Account type icons following the requested design
const getAccountTypeIcon = (accountType: AccountType) => {
  switch (accountType) {
    case "checking":
      return <Wallet className="h-5 w-5 text-primary" />;
    case "savings":
      return <PiggyBank className="h-5 w-5 text-primary" />;
    case "credit":
      return <CreditCard className="h-5 w-5 text-primary" />;
    default:
      return <Wallet className="h-5 w-5 text-primary" />;
  }
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "updatedAt_desc", label: "Recently Updated" },
  { value: "updatedAt_asc", label: "Oldest Updated" },
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "accountHolder_asc", label: "Name A-Z" },
  { value: "accountHolder_desc", label: "Name Z-A" },
  { value: "balance_desc", label: "Highest Balance" },
  { value: "balance_asc", label: "Lowest Balance" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: "6", label: "6 per page" },
  { value: "12", label: "12 per page" },
  { value: "24", label: "24 per page" },
  { value: "50", label: "50 per page" },
  { value: "all", label: "Show all" },
];

const DEFAULT_ITEMS_PER_PAGE = 6;

// Simple confirmation dialog component
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
  testId?: string;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
  testId,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid={testId}>
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid={testId ? `${testId}-title` : undefined}>
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription data-testid={testId ? `${testId}-description` : undefined}>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 pt-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
            data-testid={testId ? `${testId}-cancel` : undefined}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
            data-testid={testId ? `${testId}-confirm` : undefined}
          >
            {loading ? t("processing") : t("delete")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton components for loading states
function AccountSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded w-24 animate-pulse" />
          <div className="h-3 bg-muted rounded w-20 animate-pulse" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-6 bg-muted rounded w-20 animate-pulse" />
        <div className="h-4 bg-muted rounded w-16 animate-pulse" />
      </div>
    </div>
  );
}

export default function AllAccountsPage() {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccounts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const totalBalance = useSelector(selectTotalBalance);

  const { t } = useTranslation();
  const { showDeleteSuccess, showScrollToTop, hideScrollToTop } = useToast();

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt_desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("6");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accountId: string;
    accountName: string;
    accountNumber: string;
    loading: boolean;
  }>({
    open: false,
    accountId: "",
    accountName: "",
    accountNumber: "",
    loading: false,
  });
  
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      dispatch(setLoading({ key: "accounts", value: true }));
      dispatch(clearError());

      try {
        const response = await fetch("/api/accounts");
        const data = await response.json();

        if (data.success) {
          const accountsWithISODates = data.data.map(
            (account: {
              id: string;
              accountNumber: string;
              accountType: string;
              accountHolder: string;
              balance: number;
              currency: string;
              isActive: boolean;
              ownerId: number;
              createdAt: string;
              updatedAt: string;
            }) => ({
              ...account,
              createdAt:
                typeof account.createdAt === "string"
                  ? account.createdAt
                  : account.createdAt,
              updatedAt:
                typeof account.updatedAt === "string"
                  ? account.updatedAt
                  : account.updatedAt,
            })
          );
          dispatch(setAccounts(accountsWithISODates));
        } else {
          dispatch(setError(data.error || "Failed to fetch accounts"));
        }
      } catch (err) {
        dispatch(setError("Network error occurred"));
        console.error("Fetch accounts error:", err);
      } finally {
        dispatch(setLoading({ key: "accounts", value: false }));
      }
    };

    fetchAccounts();
  }, [dispatch]);

  // Filter and sort accounts based on search criteria and sort option
  const filteredAccounts = searchAccounts(accounts, searchCriteria);
  const sortedFilteredAccounts = sortAccounts(filteredAccounts, sortBy);
  const activeAccounts = accounts.filter((acc) => acc.isActive).length;

  // Pagination logic
  const itemsPerPageNumber = itemsPerPage === "all" ? sortedFilteredAccounts.length : parseInt(itemsPerPage);
  const totalPages = itemsPerPage === "all" ? 1 : Math.ceil(sortedFilteredAccounts.length / itemsPerPageNumber);
  const startIndex = itemsPerPage === "all" ? 0 : (currentPage - 1) * itemsPerPageNumber;
  const endIndex = itemsPerPage === "all" ? sortedFilteredAccounts.length : startIndex + itemsPerPageNumber;
  const paginatedAccounts = sortedFilteredAccounts.slice(startIndex, endIndex);

  // Reset to page 1 when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCriteria, sortBy, itemsPerPage]);

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 400) {
        showScrollToTop();
      } else {
        hideScrollToTop();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showScrollToTop, hideScrollToTop]);

  const handleCreateAccount = () => {
    setEditingAccount(undefined);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleTransferClick = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowTransferForm(true);
  };

  const handleDeleteClick = (account: BankAccount) => {
    // Check if account has balance before showing confirmation
    if (account.balance > 0) {
      setAccountToDelete(account);
      setShowDeleteWarning(true);
      return;
    }
    
    setDeleteDialog({
      open: true,
      accountId: account.id,
      accountName: account.accountHolder,
      accountNumber: account.accountNumber,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/accounts/${deleteDialog.accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        dispatch(deleteAccount(deleteDialog.accountId));
        setDeleteDialog({ open: false, accountId: "", accountName: "", accountNumber: "", loading: false });
        
        // Show success toast
        showDeleteSuccess(deleteDialog.accountName, deleteDialog.accountNumber);
      } else {
        dispatch(setError(data.error || "Failed to delete account"));
        setDeleteDialog((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      dispatch(setError("Network error occurred"));
      console.error("Delete account error:", error);
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFormClose = () => {
    setShowAccountForm(false);
    setShowTransferForm(false);
    setEditingAccount(undefined);
    setSelectedAccount(null);
  };

  const handleFormSuccess = () => {
    setShowAccountForm(false);
    setShowTransferForm(false);
    setEditingAccount(undefined);
    setSelectedAccount(null);
  };

  const handleClearFilters = () => {
    setSearchCriteria({});
  };

  // Loading state
  if (loading.accounts) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-muted rounded w-64 animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
          </div>
          <div className="h-9 bg-muted rounded w-32 animate-pulse" />
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <AccountSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {t("error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                dispatch(clearError());
                window.location.reload();
              }}
              className="w-full"
            >
              {t("refresh")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("allAccounts")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all your bank accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowTransferForm(true)}
            variant="outline"
            className="flex items-center gap-2"
            disabled={accounts.filter(acc => acc.isActive).length < 2}
            data-testid="transfer-button-header"
          >
            <ArrowRightLeft className="h-4 w-4" />
            {t("transfer")}
          </Button>
          <Button
            onClick={handleCreateAccount}
            className="flex items-center gap-2"
            data-testid="create-account-button"
          >
            <Plus className="h-4 w-4" />
            {t("createAccount")}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchCriteria={searchCriteria}
        onSearchChange={setSearchCriteria}
        onClearFilters={handleClearFilters}
        resultCount={sortedFilteredAccounts.length}
        totalCount={accounts.length}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("accounts")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("active")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("filtered")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedFilteredAccounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("accounts")}
              </CardTitle>
              <CardDescription className="mt-1">
                {sortedFilteredAccounts.length === 0 
                  ? "No accounts found"
                  : itemsPerPage === "all" 
                    ? `Showing all ${sortedFilteredAccounts.length} accounts`
                    : `Showing ${paginatedAccounts.length} of ${sortedFilteredAccounts.length} accounts (Page ${currentPage} of ${totalPages})`}
              </CardDescription>
            </div>
            
            {/* Sort, View Toggle, and Items Per Page */}
            <div className="flex items-center gap-3">
              {/* Items Per Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Show:</span>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue 
                      displayValue={(() => {
                        const selectedOption = ITEMS_PER_PAGE_OPTIONS.find(option => option.value === itemsPerPage);
                        return selectedOption ? selectedOption.label : itemsPerPage;
                      })()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue
                      displayValue={(() => {
                        const selectedOption = sortOptions.find(option => option.value === sortBy);
                        return selectedOption ? selectedOption.label : sortBy;
                      })()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-xl p-1 shadow-subtle">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedFilteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {accounts.length === 0 ? t("noAccountsFound") : t("noMatchingAccounts")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {accounts.length === 0 
                  ? t("createFirstAccount")
                  : t("adjustSearchCriteria")}
              </p>
              {accounts.length === 0 ? (
                <Button onClick={handleCreateAccount} data-testid="create-account-button-empty">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createAccount")}
                </Button>
              ) : (
                <Button onClick={handleClearFilters} variant="outline">
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Accounts Display */}
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {paginatedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 bg-card rounded-xl shadow-subtle hover:shadow-card transition-all theme-transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {getAccountTypeIcon(account.accountType)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {account.accountHolder}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {account.accountNumber} • {t(account.accountType)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("ownerId")}: {account.ownerId} • {t("createdAt")}: {formatDate(account.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatCurrency(account.balance, account.currency)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={account.isActive ? "default" : "secondary"}
                            >
                              {account.isActive ? t("active") : t("inactive")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {account.currency}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {account.isActive && accounts.filter(acc => acc.isActive && acc.id !== account.id).length > 0 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleTransferClick(account)}
                              className="h-8 w-8"
                              title={t("transfer")}
                              data-testid={`transfer-button-${account.id}`}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditAccount(account)}
                            className="h-8 w-8"
                            data-testid="edit-account-button"
                            title={t("edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(account)}
                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                            title={t("delete")}
                            data-testid="delete-account-button"
                          >
                            <Trash2 className="h-4 w-4" data-testid="trash-icon" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedAccounts.map((account) => (
                    <Card key={account.id} className="hover:shadow-card transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {getAccountTypeIcon(account.accountType)}
                            </div>
                            <div>
                              <CardTitle className="text-base">{account.accountHolder}</CardTitle>
                              <p className="text-sm text-muted-foreground">{t(account.accountType)}</p>
                            </div>
                          </div>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? t("active") : t("inactive")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-mono text-sm">{account.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(account.balance, account.currency)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <p>Owner: {account.ownerId}</p>
                          <p>Currency: {account.currency}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {account.isActive && accounts.filter(acc => acc.isActive && acc.id !== account.id).length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransferClick(account)}
                              className="flex-1"
                              data-testid={`transfer-button-grid-${account.id}`}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-1" />
                              Transfer
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                            className="flex-1"
                            data-testid="edit-account-button"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(account)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                            data-testid="delete-account-button-grid"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && itemsPerPage !== "all" && (
                <div className="flex items-center justify-between pt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedFilteredAccounts.length)} of {sortedFilteredAccounts.length} accounts
                  </div>
                  <div className="flex items-center gap-2">
                    {/* First Page Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                      First
                    </Button>
                    
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-muted-foreground">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Last Page Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Last
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Show all indicator */}
              {itemsPerPage === "all" && sortedFilteredAccounts.length > 0 && (
                <div className="pt-6 border-t">
                  <div className="text-sm text-muted-foreground text-center">
                    Showing all {sortedFilteredAccounts.length} accounts
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Account Form Modal */}
      {showAccountForm && (
        <AccountForm
          account={editingAccount}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <TransferForm
          {...(selectedAccount && { fromAccount: selectedAccount })}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog((prev) => ({ ...prev, open: false }))
        }
        title={t("deleteAccount")}
        description={t("deleteConfirmation", { accountName: deleteDialog.accountName })}
        onConfirm={handleDeleteConfirm}
        loading={deleteDialog.loading}
        testId="delete-confirmation-dialog"
      />

      {/* Delete Warning Modal */}
      {showDeleteWarning && accountToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="delete-warning-modal">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="delete-warning-title">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                {t("operationNotAllowed")}
              </CardTitle>
              <CardDescription data-testid="delete-warning-description">
                {t("cannotDeleteWithBalance")}. This account has a balance of {formatCurrency(accountToDelete.balance, accountToDelete.currency)}. Please transfer the funds or update the balance to zero before deleting.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteWarning(false);
                  setAccountToDelete(null);
                }}
                className="flex-1"
                data-testid="delete-warning-ok-button"
              >
                {t("ok")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 