"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  selectAccounts,
  selectLoading,
  selectError,
  selectTotalBalanceInCurrency,
  selectDefaultCurrency,
  setAccounts,
  setLoading,
  setError,
  clearError,
  deleteAccount,
  convertCurrency,
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
import { formatCurrency, formatDate } from "@/lib/utils";
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
  Eye,
  ArrowRight,
} from "lucide-react";
import { BankAccount, AccountType } from "@/types";
import { useToast } from "@/components/ui/toast";

// Account type icons following the requested design
const getAccountTypeIcon = (accountType: AccountType) => {
  switch (accountType) {
    case "checking":
      return <Wallet className="h-5 w-5" />;
    case "savings":
      return <PiggyBank className="h-5 w-5" />;
    case "credit":
      return <CreditCard className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
};

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

// Skeleton component for loading states
function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
      </CardContent>
    </Card>
  );
}

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

export default function HomePage() {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccounts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const totalBalance = useSelector(selectTotalBalanceInCurrency);
  const defaultCurrency = useSelector(selectDefaultCurrency);

  const { t } = useTranslation();
  const { showDeleteSuccess, showScrollToTop, hideScrollToTop } = useToast();

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<
    BankAccount | undefined
  >();
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
          // The API returns accounts with ISO string dates, so we can dispatch them directly
          const accountsWithISODates = data.data.map(
            (account: {
              id: string;
              accountNumber: string;
              accountType: string;
              accountHolder: string;
              balance: number;
              currency: string;
              isActive: boolean;
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
        console.error("Error fetching accounts:", err);
      } finally {
        dispatch(setLoading({ key: "accounts", value: false }));
      }
    };

    fetchAccounts();
  }, [dispatch]);

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

  // Calculate stats
  const activeAccounts = accounts.filter((account) => account.isActive).length;
  
  // Sort accounts by recently updated first and show up to 3 accounts
  const sortedAccounts = [...accounts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const displayAccounts = sortedAccounts.slice(0, 3);

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
    const { accountId } = deleteDialog;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        dispatch(deleteAccount(accountId));
        setDeleteDialog({
          open: false,
          accountId: "",
          accountName: "",
          accountNumber: "",
          loading: false,
        });
        
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
    // Form will handle Redux state updates automatically
    setShowAccountForm(false);
    setShowTransferForm(false);
    setEditingAccount(undefined);
    setSelectedAccount(null);
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

        {/* Accounts Summary */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32 animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <AccountSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("bankManagementSystem")}
          </h1>
          <p className="text-muted-foreground mt-1 mobile-text-responsive">{t("accounts")}</p>
        </div>
        <div className="mobile-button-group">
          <Button
            onClick={() => setShowTransferForm(true)}
            variant="outline"
            className="mobile-action-button mobile-touch-target"
            disabled={accounts.filter(acc => acc.isActive).length < 2}
            data-testid="transfer-button-header"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="ml-2">{t("transfer")}</span>
          </Button>
          <Button
            onClick={handleCreateAccount}
            className="mobile-action-button mobile-touch-target"
            data-testid="create-account-button"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-2">{t("createAccount")}</span>
          </Button>
        </div>
      </div>

      {/* Accounts Summary - replaces filters with cleaner design */}
      <Card className="border-l-4 border-l-primary/20">
        <CardContent className="mobile-card-padding py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {displayAccounts.length === 1 
                    ? `${t("showing")} 1 ${t("account")}` 
                    : `${t("showing")} ${displayAccounts.length} ${t("accounts")}`}
                </span>
              </div>
              <div className="h-px sm:h-4 w-full sm:w-px bg-border" />
              <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{activeAccounts} {t("active").toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>{accounts.length - activeAccounts} {t("inactive").toLowerCase()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Total: {formatCurrency(totalBalance, defaultCurrency)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="responsive-grid-1-3">
        <Card className="transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mobile-card-padding">
            <CardTitle className="text-sm font-medium">
              {t("balance")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mobile-card-padding pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalBalance, defaultCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("available")} • {defaultCurrency}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mobile-card-padding">
            <CardTitle className="text-sm font-medium">
              {t("accounts")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mobile-card-padding pt-0">
            <div className="text-xl sm:text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length - activeAccounts}{" "}
              {t("inactive").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mobile-card-padding">
            <CardTitle className="text-sm font-medium">
              {t("accountType")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="mobile-card-padding pt-0">
            <div className="text-xl sm:text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("totalManaged")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List - Show Only First Account */}
      <Card className="transition-all duration-300">
        <CardHeader className="mobile-card-padding">
          <CardTitle>{t("accounts")}</CardTitle>
          <CardDescription>
            {accounts.length <= 3 
              ? t("accountDetails")
              : `${t("showing")} 3 ${t("of")} ${accounts.length} ${t("accounts")}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card-padding pt-0">
          {displayAccounts.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                {t("noAccountsFound")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("createFirstAccount")}
              </p>
              <Button 
                onClick={handleCreateAccount} 
                data-testid="create-account-button-empty"
                className="mobile-action-button mobile-touch-target"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("createAccount")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {displayAccounts.map((account) => (
                <div
                  key={account.id}
                  className="account-card-mobile"
                >
                  <div className="account-info">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground truncate">
                        {account.accountHolder}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {account.accountNumber} • {t(account.accountType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("createdAt")}: {formatDate(account.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="account-balance">
                      <div className="font-semibold text-base sm:text-lg">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                      {account.currency !== defaultCurrency && (
                        <div className="text-sm text-muted-foreground">
                          ≈ {formatCurrency(convertCurrency(account.balance, account.currency, defaultCurrency), defaultCurrency)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                        >
                          {account.isActive
                            ? t("active")
                            : t("inactive")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {account.currency}
                        </span>
                      </div>
                    </div>
                    
                    <div className="account-actions">
                      {account.isActive && accounts.filter(acc => acc.isActive && acc.id !== account.id).length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleTransferClick(account)}
                          className="mobile-icon-button mobile-touch-target"
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
                        className="mobile-icon-button mobile-touch-target"
                        data-testid="edit-account-button"
                        title={t("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(account)}
                        className="mobile-icon-button mobile-touch-target hover:bg-destructive hover:text-destructive-foreground"
                        title={t("delete")}
                        data-testid="delete-account-button"
                      >
                        <Trash2 className="h-4 w-4" data-testid="trash-icon" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* View All Accounts Button */}
              {accounts.length > 3 && (
                <div className="pt-4">
                  <Link href="/accounts" className="block">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 mobile-action-button mobile-touch-target"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{t("viewAllAccounts")}</span>
                      <span className="text-sm text-muted-foreground mobile-hide-text">
                        ({accounts.length - 3} more)
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
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
        description={`Are you sure you want to delete the account "${deleteDialog.accountName}"? This action cannot be undone.`}
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
