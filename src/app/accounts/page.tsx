"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
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
import { formatCurrency, formatDate, searchAccounts } from "@/lib/utils";
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
} from "lucide-react";
import { BankAccount, AccountType, SearchCriteria } from "@/types";

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
  const { t } = useTranslation();
  
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
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
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
  const router = useRouter();

  const { t } = useTranslation();

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
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

  // Filter accounts based on search criteria
  const filteredAccounts = searchAccounts(accounts, searchCriteria);
  const activeAccounts = accounts.filter((acc) => acc.isActive).length;

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
        setDeleteDialog({ open: false, accountId: "", accountName: "", loading: false });
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
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
            onClick={handleCreateAccount}
            className="flex items-center gap-2"
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
        resultCount={filteredAccounts.length}
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
            <div className="text-2xl font-bold">{filteredAccounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("accounts")}</CardTitle>
          <CardDescription>
            {filteredAccounts.length === accounts.length
              ? `${t("showing")} ${t("allAccounts").toLowerCase()} ${accounts.length} ${t("accounts")}`
              : `${t("showing")} ${filteredAccounts.length} ${t("of")} ${accounts.length} ${t("accounts")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
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
                <Button onClick={handleCreateAccount}>
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
            <div className="space-y-4">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
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
        />
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && selectedAccount && (
        <TransferForm
          fromAccount={selectedAccount}
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
      />

      {/* Delete Warning Modal */}
      {showDeleteWarning && accountToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                {t("operationNotAllowed")}
              </CardTitle>
              <CardDescription>
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