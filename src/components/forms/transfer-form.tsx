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
  selectAccountsWithDates,
  updateAccount,
  setLoading,
  setError,
} from "@/store/redux-store";
import { BankAccount } from "@/types";
import { X, ArrowRight, AlertTriangle, RefreshCw, DollarSign } from "lucide-react";
import { 
  formatCurrencyWithSymbol, 
  getCurrencyConversionPreview,
  isDifferentCurrency,
  validateTransferBalance 
} from "@/lib/utils";

interface TransferFormProps {
  fromAccount: BankAccount;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferForm({
  fromAccount,
  onClose,
  onSuccess,
}: TransferFormProps) {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccountsWithDates);
  const { t } = useTranslation();

  // Get available destination accounts (active accounts except the source account)
  const availableAccounts = accounts.filter(
    (account) => account.isActive && account.id !== fromAccount.id
  );

  const [formData, setFormData] = useState({
    toAccountId: "",
    amount: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const toAccount = availableAccounts.find(
    (account) => account.id === formData.toAccountId
  );

  // Calculate currency conversion preview
  const conversionPreview = useMemo(() => {
    if (!toAccount || !formData.amount || isNaN(parseFloat(formData.amount))) {
      return null;
    }

    const amount = parseFloat(formData.amount);
    return getCurrencyConversionPreview(
      amount,
      fromAccount.currency,
      toAccount.currency
    );
  }, [formData.amount, fromAccount.currency, toAccount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate destination account
    if (!formData.toAccountId) {
      newErrors.toAccountId = t("fieldRequired");
    } else if (formData.toAccountId === fromAccount.id) {
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
    } else if (!validateTransferBalance(fromAccount, amount)) {
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

    if (!validateForm() || !toAccount) {
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading({ key: "createTransaction", value: true }));

    try {
      const amount = parseFloat(formData.amount);
      const isDifferentCurrencies = isDifferentCurrency(
        fromAccount.currency,
        toAccount.currency
      );
      
      const transferData = {
        fromAccountId: fromAccount.id,
        toAccountId: formData.toAccountId,
        amount,
        description: formData.description.trim(),
        type: "transfer" as const,
        // Include currency conversion data if currencies are different
        ...(isDifferentCurrencies && conversionPreview && {
          exchangeRate: conversionPreview.exchangeRate,
          convertedAmount: conversionPreview.targetAmount,
          sourceCurrency: fromAccount.currency,
          targetCurrency: toAccount.currency,
        }),
      };

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();

      if (data.success) {
        // Update account balances in Redux store
        dispatch(
          updateAccount({
            id: fromAccount.id,
            updates: {
              balance: fromAccount.balance - amount,
              updatedAt: new Date().toISOString(),
            },
          })
        );

        // For different currencies, use converted amount for destination
        const targetAmount = isDifferentCurrencies && conversionPreview 
          ? conversionPreview.targetAmount 
          : amount;

        dispatch(
          updateAccount({
            id: toAccount.id,
            updates: {
              balance: toAccount.balance + targetAmount,
              updatedAt: new Date().toISOString(),
            },
          })
        );

        onSuccess?.();
        onClose();
      } else {
        // Handle specific backend errors
        const errorMessage = data.error || "Failed to process transfer";
        
        // Map specific backend errors to translated messages
        if (errorMessage.includes("Currency mismatch")) {
          setBackendError(t("currencyMismatch"));
        } else if (errorMessage.includes("Insufficient funds")) {
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
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            {t("transferFunds")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Backend Error Display */}
          {backendError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">{t("error")}</span>
              </div>
              <p className="text-sm text-destructive mt-1">{backendError}</p>
            </div>
          )}

          {/* Transfer Summary */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("fromAccount")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t(fromAccount.accountType)}</Badge>
                <Badge variant="outline" className="text-xs">
                  {fromAccount.currency}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{fromAccount.accountHolder}</p>
                <p className="text-sm text-muted-foreground">
                  #{fromAccount.accountNumber} • {t("ownerId")}: {fromAccount.ownerId}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrencyWithSymbol(fromAccount.balance, fromAccount.currency)}
                </p>
                <p className="text-xs text-muted-foreground">{t("available")}</p>
              </div>
            </div>
            {fromAccount.balance <= 0 && (
              <div className="flex items-center gap-2 mt-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t("insufficientFunds")}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Destination Account */}
            <div className="space-y-2">
              <Label htmlFor="toAccount">{t("toAccount")} *</Label>
              {availableAccounts.length === 0 ? (
                <div className="p-4 border rounded-md bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    No other active accounts available for transfer
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, toAccountId: value })
                  }
                >
                  <SelectTrigger
                    id="toAccount"
                    className={errors.toAccountId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder={t("toAccount")}>
                      {formData.toAccountId && (() => {
                        const selectedAccount = availableAccounts.find(acc => acc.id === formData.toAccountId);
                        return selectedAccount ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {selectedAccount.accountHolder}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {t(selectedAccount.accountType)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              #{selectedAccount.accountNumber}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
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
                                variant={isDifferentCurrency(fromAccount.currency, account.currency) ? "secondary" : "outline"} 
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
                <p className="text-sm text-destructive">{errors.toAccountId}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {fromAccount.currency}
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={`pl-16 ${errors.amount ? "border-destructive" : ""}`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("available")}: {formatCurrencyWithSymbol(fromAccount.balance, fromAccount.currency)}</span>
                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                  <span>
                    {t("remaining")}:{" "}
                    {formatCurrencyWithSymbol(
                      Math.max(0, fromAccount.balance - parseFloat(formData.amount)),
                      fromAccount.currency
                    )}
                  </span>
                )}
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            {/* Currency Conversion Preview */}
            {toAccount && conversionPreview && conversionPreview.isDifferent && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {t("currencyConversion")}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("youSend")}:</span>
                    <span className="font-medium">
                      {formatCurrencyWithSymbol(conversionPreview.sourceAmount, fromAccount.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("theyReceive")}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrencyWithSymbol(conversionPreview.targetAmount, toAccount.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("exchangeRate")}:</span>
                    <span>1 {fromAccount.currency} = {conversionPreview.exchangeRate.toFixed(4)} {toAccount.currency}</span>
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
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formData.description.length}/200 characters</span>
              </div>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Transfer Preview */}
            {toAccount && formData.amount && !isNaN(parseFloat(formData.amount)) && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("transferSummary")}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t("from")}:</span>
                    <span>{fromAccount.accountHolder} ({fromAccount.currency})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("to")}:</span>
                    <span>{toAccount.accountHolder} ({toAccount.currency})</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>{t("amount")}:</span>
                    <span>{formatCurrencyWithSymbol(parseFloat(formData.amount), fromAccount.currency)}</span>
                  </div>
                  {conversionPreview && conversionPreview.isDifferent && (
                    <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                      <span>{t("recipientGets")}:</span>
                      <span>{formatCurrencyWithSymbol(conversionPreview.targetAmount, toAccount.currency)}</span>
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
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isSubmitting ||
                  fromAccount.balance <= 0 ||
                  availableAccounts.length === 0
                }
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