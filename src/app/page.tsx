"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAccounts,
  selectAccountsWithDates,
  selectLoading,
  selectError,
  selectTotalBalance,
  selectLocale,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  Plus,
  CreditCard,
  TrendingUp,
  Users,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { BankAccount } from "@/types";

// Simple confirmation dialog component
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 pt-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Deleting..." : "Delete"}
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
  const accountsWithDates = useSelector(selectAccountsWithDates);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const totalBalance = useSelector(selectTotalBalance);
  const locale = useSelector(selectLocale);

  const { t } = useTranslation(locale);

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<
    BankAccount | undefined
  >();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accountId: string;
    accountName: string;
    loading: boolean;
  }>({
    open: false,
    accountId: "",
    accountName: "",
    loading: false,
  });

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

  const activeAccounts = accounts.filter((acc) => acc.isActive).length;

  const handleCreateAccount = () => {
    setEditingAccount(undefined);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleDeleteClick = (account: BankAccount) => {
    setDeleteDialog({
      open: true,
      accountId: account.id,
      accountName: account.accountHolder,
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
          loading: false,
        });
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
    setEditingAccount(undefined);
  };

  const handleFormSuccess = () => {
    // Form will handle Redux state updates automatically
    setShowAccountForm(false);
    setEditingAccount(undefined);
  };

  // Use accounts with dates for display
  const displayAccounts = accountsWithDates;

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
      <div className="space-y-6 animate-fade-in">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-destructive font-medium">
                  Error loading accounts
                </p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => window.location.reload()}
                variant="destructive"
                size="sm"
              >
                Try Again
              </Button>
              <Button
                onClick={() => dispatch(clearError())}
                variant="outline"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("accounts.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("accounts.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateAccount}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("nav.addAccount")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("accounts.totalBalance")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("accounts.acrossAllActive")}
            </p>
          </CardContent>
        </Card>

        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("accounts.activeAccounts")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length - activeAccounts}{" "}
              {t("accounts.inactive").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("accounts.accountTypes")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("accounts.totalManaged")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card className="theme-transition">
        <CardHeader>
          <CardTitle>{t("accounts.yourAccounts")}</CardTitle>
          <CardDescription>{t("accounts.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {displayAccounts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t("accounts.noAccountsTitle")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("accounts.noAccountsMessage")}
              </p>
              <Button onClick={handleCreateAccount}>
                <Plus className="h-4 w-4 mr-2" />
                {t("accounts.createAccount")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors theme-transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {account.accountHolder}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {account.accountNumber} • {account.accountType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("accounts.created", {
                          date: formatDate(account.createdAt),
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={account.isActive ? "success" : "secondary"}
                        >
                          {account.isActive
                            ? t("accounts.active")
                            : t("accounts.inactive")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {account.currency}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleEditAccount({
                            ...account,
                            createdAt: account.createdAt.toISOString(),
                            updatedAt: account.updatedAt.toISOString(),
                          })
                        }
                        className="h-8 w-8"
                        data-testid="edit-account-button"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleDeleteClick({
                            ...account,
                            createdAt: account.createdAt.toISOString(),
                            updatedAt: account.updatedAt.toISOString(),
                          })
                        }
                        className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" data-testid="trash-icon" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
          locale={locale}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog((prev) => ({ ...prev, open: false }))
        }
        title={t("accounts.deleteAccount")}
        description={t("accounts.deleteConfirmation", {
          name: deleteDialog.accountName,
        })}
        onConfirm={handleDeleteConfirm}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
