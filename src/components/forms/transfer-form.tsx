"use client";

import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  selectAccounts,
  updateAccount,
  setLoading,
  setError,
} from "@/store/redux-store";
import { BankAccount } from "@/types";
import { X, ArrowRightLeft, RefreshCw, DollarSign } from "lucide-react";
import { 
  formatCurrencyWithSymbol, 
  getCurrencyConversionPreview,
  isDifferentCurrency,
  validateTransferBalance 
} from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface TransferFormProps {
  fromAccount?: BankAccount; // Make this optional
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferForm({
  fromAccount,
  onClose,
  onSuccess,
}: TransferFormProps) {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccounts);
  const { t } = useTranslation();
  const { showTransferSuccess } = useToast();

  // Get all active accounts
  const activeAccounts = accounts.filter((account) => account.isActive);

  const [formData, setFormData] = useState({
    fromAccountId: fromAccount?.id || "",
    toAccountId: "",
    amount: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Get current from and to accounts
  const currentFromAccount = activeAccounts.find(
    (account) => account.id === formData.fromAccountId
  );
  
  const toAccount = activeAccounts.find(
    (account) => account.id === formData.toAccountId
  );

  // Get available destination accounts (active accounts except the source account)
  const availableToAccounts = activeAccounts.filter(
    (account) => account.id !== formData.fromAccountId
  );

  // Get available source accounts (all active accounts if no fromAccount specified)
  const availableFromAccounts = fromAccount ? [fromAccount] : activeAccounts;

  // Calculate currency conversion preview
  const conversionPreview = useMemo(() => {
    if (!toAccount || !currentFromAccount || !formData.amount || isNaN(parseFloat(formData.amount))) {
      return null;
    }

    const amount = parseFloat(formData.amount);
    return getCurrencyConversionPreview(
      amount,
      currentFromAccount.currency,
      toAccount.currency
    );
  }, [formData.amount, currentFromAccount, toAccount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate source account
    if (!formData.fromAccountId) {
      newErrors.fromAccountId = t("fieldRequired");
    }

    // Validate destination account
    if (!formData.toAccountId) {
      newErrors.toAccountId = t("fieldRequired");
    } else if (formData.toAccountId === formData.fromAccountId) {
      newErrors.toAccountId = "Cannot transfer to the same account";
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount.trim()) {
      newErrors.amount = t("fieldRequired");
    } else if (isNaN(amount)) {
      newErrors.amount = t("invalidAmount");
    } else if (amount <= 0) {
      newErrors.amount = t("negativeAmount");
    } else if (amount < 0.01) {
      newErrors.amount = t("minTransferAmount");
    } else if (!currentFromAccount || !validateTransferBalance(currentFromAccount, amount)) {
      newErrors.amount = t("insufficientFunds");
    } else if (amount > 100000) {
      newErrors.amount = t("maxTransferAmount");
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = t("fieldRequired");
    } else if (formData.description.trim().length < 3) {
      newErrors.description = t("descriptionMinLength");
    } else if (formData.description.length > 200) {
      newErrors.description = t("descriptionMaxLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    if (!validateForm()) {
      return;
    }

    if (!currentFromAccount || !toAccount) {
      setBackendError("Please select both source and destination accounts");
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading({ key: "createTransaction", value: true }));

    try {
      const amount = parseFloat(formData.amount);
      const isDifferentCurrencies = isDifferentCurrency(
        currentFromAccount.currency,
        toAccount.currency
      );
      
      const transferData = {
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount,
        description: formData.description,
        type: "transfer" as const,
        ...(isDifferentCurrencies && conversionPreview && {
          exchangeRate: conversionPreview.exchangeRate,
          convertedAmount: conversionPreview.targetAmount,
          sourceCurrency: currentFromAccount.currency,
          targetCurrency: toAccount.currency,
        }),
      };

      console.log("Submitting transfer:", transferData);

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();
      console.log("Transfer response:", data);

      if (data.success) {
        // Calculate target amount
        const targetAmount = conversionPreview?.targetAmount || amount;

        // Update balances in Redux store
        dispatch(
          updateAccount({
            id: formData.fromAccountId,
            updates: {
              balance: currentFromAccount.balance - amount,
              updatedAt: new Date().toISOString(),
            },
          })
        );

        dispatch(
          updateAccount({
            id: formData.toAccountId,
            updates: {
              balance: toAccount.balance + targetAmount,
              updatedAt: new Date().toISOString(),
            },
          })
        );

        // Show success toast
        showTransferSuccess(
          currentFromAccount.accountHolder,
          toAccount.accountHolder,
          formatCurrencyWithSymbol(amount, currentFromAccount.currency)
        );

        onSuccess?.();
      } else {
        // Handle specific error cases
        const errorMessage = data.error || "Transfer failed";
        
        if (errorMessage.includes("Insufficient funds")) {
          setBackendError(t("insufficientFunds"));
        } else if (errorMessage.includes("Account not found")) {
          setBackendError(t("accountNotFound"));
        } else if (errorMessage.includes("Account inactive")) {
          setBackendError("Source or destination account is inactive");
        } else if (errorMessage.includes("Same account")) {
          setBackendError("Cannot transfer to the same account");
        } else if (errorMessage.includes("Exchange rate")) {
          setBackendError("Currency exchange rate unavailable");
        } else {
          setBackendError(errorMessage);
        }
        
        dispatch(setError(data.error || "Failed to process transfer"));
      }
    } catch (error) {
      const networkError = "Network error occurred while processing transfer";
      setBackendError(networkError);
      dispatch(setError(networkError));
      console.error("Transfer error:", error);
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading({ key: "createTransaction", value: false }));
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setFormData({ ...formData, amount: numericValue });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" data-testid="transfer-form-modal">
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
            {t("transferFunds")}
          </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              data-testid="transfer-form-close"
            >
            <X className="h-4 w-4" />
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          {backendError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md" data-testid="transfer-error-message">
              <p className="text-sm text-destructive">{backendError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="transfer-form">
            {/* Source Account */}
            <div className="space-y-2">
              <Label htmlFor="fromAccount">{t("fromAccount")} *</Label>
              {fromAccount ? (
                <div className="p-4 border rounded-md bg-muted/30" data-testid="from-account-display">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {fromAccount.accountHolder}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {t(fromAccount.accountType)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {fromAccount.currency}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        #{fromAccount.accountNumber} • {t("ownerId")}: {fromAccount.ownerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrencyWithSymbol(fromAccount.balance, fromAccount.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
              <Select
                value={formData.fromAccountId}
                onValueChange={(value: string) =>
                    setFormData({ ...formData, fromAccountId: value, toAccountId: "" })
                }
              >
                <SelectTrigger className="mobile-touch-target" data-testid="from-account-select">
                  <SelectValue placeholder={t("selectFromAccount")}>
                    {formData.fromAccountId && (() => {
                      const selectedAccount = availableFromAccounts.find(acc => acc.id === formData.fromAccountId);
                      return selectedAccount ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{selectedAccount.accountHolder}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {selectedAccount.accountNumber} • {t(selectedAccount.accountType)}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                  <SelectContent data-testid="from-account-options">
                  {availableFromAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} data-testid={`from-account-option-${account.id}`}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {account.accountHolder}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {t(account.accountType)}
                            </Badge>
                              <Badge variant="outline" className="text-xs">
                              {account.currency}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            #{account.accountNumber} • {t("ownerId")}: {account.ownerId}
                          </span>
                        </div>
                        <div className="text-right ml-4">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrencyWithSymbol(account.balance, account.currency)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              )}
              {errors.fromAccountId && (
                <p className="text-sm text-destructive" data-testid="from-account-error">{errors.fromAccountId}</p>
              )}
            </div>

            {/* Destination Account */}
            <div className="space-y-2">
              <Label htmlFor="toAccount">{t("toAccount")} *</Label>
              {availableToAccounts.length === 0 ? (
                <div className="p-4 border rounded-md bg-muted/30" data-testid="no-destination-accounts">
                  <p className="text-sm text-muted-foreground">
                    {formData.fromAccountId 
                      ? "No other active accounts available for transfer"
                      : "Please select a source account first"}
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, toAccountId: value })
                  }
                >
                  <SelectTrigger className="mobile-touch-target" data-testid="to-account-select">
                    <SelectValue placeholder={t("selectToAccount")}>
                      {formData.toAccountId && (() => {
                        const selectedAccount = availableToAccounts.find(acc => acc.id === formData.toAccountId);
                        return selectedAccount ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{selectedAccount.accountHolder}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {selectedAccount.accountNumber} • {t(selectedAccount.accountType)}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent data-testid="to-account-options">
                    {availableToAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} data-testid={`to-account-option-${account.id}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {account.accountHolder}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {t(account.accountType)}
                              </Badge>
                              <Badge 
                                variant={currentFromAccount && isDifferentCurrency(currentFromAccount.currency, account.currency) ? "secondary" : "outline"} 
                                className="text-xs"
                              >
                                {account.currency}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              #{account.accountNumber} • {t("ownerId")}: {account.ownerId}
                            </span>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrencyWithSymbol(account.balance, account.currency)}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.toAccountId && (
                <p className="text-sm text-destructive" data-testid="to-account-error">{errors.toAccountId}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currentFromAccount?.currency || ""}
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`pl-12 ${errors.amount ? "border-destructive" : ""}`}
                  data-testid="transfer-amount-input"
                />
              </div>
              {currentFromAccount && (
                <div className="flex justify-between text-xs text-muted-foreground" data-testid="amount-info">
                  <span data-testid="available-balance">{t("available")}: {formatCurrencyWithSymbol(currentFromAccount.balance, currentFromAccount.currency)}</span>
                  {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                    <span data-testid="remaining-balance">
                      {t("remaining")}:{" "}
                      {formatCurrencyWithSymbol(
                        Math.max(0, currentFromAccount.balance - parseFloat(formData.amount)),
                        currentFromAccount.currency
                      )}
                    </span>
                  )}
                </div>
              )}
              {errors.amount && (
                <p className="text-sm text-destructive" data-testid="amount-error">{errors.amount}</p>
              )}
            </div>

            {/* Currency Conversion Preview */}
            {toAccount && conversionPreview && conversionPreview.isDifferent && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg" data-testid="currency-conversion-preview">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {t("currencyConversion")}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("youSend")}:</span>
                    <span className="font-medium" data-testid="conversion-send-amount">
                      {formatCurrencyWithSymbol(conversionPreview.sourceAmount, currentFromAccount?.currency ?? "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("theyReceive")}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400" data-testid="conversion-receive-amount">
                      {formatCurrencyWithSymbol(conversionPreview.targetAmount, toAccount.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("exchangeRate")}:</span>
                    <span data-testid="exchange-rate">1 {currentFromAccount?.currency} = {conversionPreview.exchangeRate.toFixed(4)} {toAccount.currency}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")} *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("transferDescriptionPlaceholder")}
                maxLength={200}
                className={errors.description ? "border-destructive" : ""}
                data-testid="transfer-description-input"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span data-testid="description-character-count">{formData.description.length}/200 characters</span>
              </div>
              {errors.description && (
                <p className="text-sm text-destructive" data-testid="description-error">{errors.description}</p>
              )}
            </div>

            {/* Transfer Preview */}
            {toAccount && formData.amount && !isNaN(parseFloat(formData.amount)) && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg" data-testid="transfer-summary">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("transferSummary")}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("from")}:</span>
                    <span data-testid="summary-from-account">{currentFromAccount?.accountHolder} ({currentFromAccount?.currency})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("to")}:</span>
                    <span data-testid="summary-to-account">{toAccount.accountHolder} ({toAccount.currency})</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>{t("amount")}:</span>
                    <span data-testid="summary-amount">{formatCurrencyWithSymbol(parseFloat(formData.amount), currentFromAccount?.currency ?? "USD")}</span>
                  </div>
                  {conversionPreview && conversionPreview.isDifferent && (
                    <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                      <span>{t("recipientGets")}:</span>
                      <span data-testid="summary-recipient-amount">{formatCurrencyWithSymbol(conversionPreview.targetAmount, toAccount.currency)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
                data-testid="transfer-cancel-button"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isSubmitting ||
                  (currentFromAccount?.balance ?? 0) <= 0 ||
                  availableToAccounts.length === 0
                }
                data-testid="transfer-submit-button"
              >
                {isSubmitting ? t("processing") : t("transferFunds")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 