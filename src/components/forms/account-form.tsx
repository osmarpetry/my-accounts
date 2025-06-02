"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WarningModal } from "@/components/ui/warning-modal";
import {
  addAccount,
  updateAccount,
  setLoading,
  setError,
} from "@/store/redux-store";
import { BankAccount, AccountType, Currency } from "@/types";
import { X, AlertTriangle, CheckCircle, CreditCard, User } from "lucide-react";
import { 
  formatCurrencyWithSymbol,
  getCurrencySymbol,
  getCurrencyName,
  getSupportedCurrencies,
} from "@/lib/utils";

interface AccountFormProps {
  account?: BankAccount | undefined;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AccountForm({
  account,
  onClose,
  onSuccess,
}: AccountFormProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isEditing = !!account;

  const accountTypes: { value: AccountType; label: string; description: string }[] = [
    { value: "checking", label: t("checking"), description: t("checkingDescription") },
    { value: "savings", label: t("savings"), description: t("savingsDescription") },
    { value: "credit", label: t("credit"), description: t("creditDescription") },
  ];

  const supportedCurrencies = getSupportedCurrencies().map(currency => ({
    value: currency,
    label: `${getCurrencySymbol(currency)} ${currency}`,
    description: getCurrencyName(currency),
  }));

  const [formData, setFormData] = useState({
    ownerId: account?.ownerId || (Math.floor(Math.random() * 900000) + 100000).toString().padStart(6, '0'),
    accountHolder: account?.accountHolder || "",
    accountType: account?.accountType || ("checking" as AccountType),
    balance: account?.balance?.toString() || "0",
    currency: account?.currency || ("USD" as Currency),
    isActive: account?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDeactivationWarning, setShowDeactivationWarning] = useState(false);
  const [serverError, setServerError] = useState<{show: boolean, message: string, type: 'warning' | 'error'}>({
    show: false,
    message: '',
    type: 'error'
  });

  const validateField = (field: string, value: string | number | boolean) => {
    const newErrors = { ...errors };

    switch (field) {
      case "ownerId":
        const ownerIdValue = value.toString().trim();
        if (!isEditing) { // Only validate owner ID during creation
          if (!ownerIdValue) {
            newErrors.ownerId = t("fieldRequired");
          } else if (!/^\d{6}$/.test(ownerIdValue)) {
            newErrors.ownerId = t("ownerIdInvalid");
          } else if (parseInt(ownerIdValue) < 100000 || parseInt(ownerIdValue) > 999999) {
            newErrors.ownerId = t("ownerIdRange");
          } else {
            delete newErrors.ownerId;
          }
        }
        break;

      case "accountHolder":
        const stringValue = value.toString().trim();
        if (!stringValue) {
          newErrors.accountHolder = t("fieldRequired");
        } else if (stringValue.length < 2) {
          newErrors.accountHolder = t("nameMinLength");
        } else if (stringValue.length > 100) {
          newErrors.accountHolder = t("nameMaxLength");
        } else if (!/^[a-zA-Z\s'-]+$/.test(stringValue)) {
          newErrors.accountHolder = t("nameInvalidCharacters");
        } else {
          delete newErrors.accountHolder;
        }
        break;

      case "balance":
        const balance = parseFloat(value.toString());
        if (value === "" || isNaN(balance)) {
          newErrors.balance = t("invalidAmount");
        } else if (balance < 0) {
          newErrors.balance = t("negativeAmount");
        } else if (balance > 1000000) {
          newErrors.balance = t("maxAmount");
        } else {
          delete newErrors.balance;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });
    validateField(field, value);
  };

  const handleStatusChange = (checked: boolean) => {
    try {
      // If trying to deactivate an account with positive balance, show warning
      if (!checked && account?.balance && account.balance > 0) {
        setShowDeactivationWarning(true);
        return;
      }
      
      // Otherwise, proceed normally
      handleFieldChange("isActive", checked);
    } catch (error) {
      console.error("Error handling status change:", error);
      setServerError({
        show: true, 
        message: "An error occurred while changing account status. Please try again.", 
        type: 'error'
      });
    }
  };

  const handleConfirmDeactivation = () => {
    // Proceed with deactivation
    handleFieldChange("isActive", false);
    setShowDeactivationWarning(false);
  };

  const handleCancelDeactivation = () => {
    // Keep the account active
    setShowDeactivationWarning(false);
    // Ensure the switch stays in active position
    setFormData({ ...formData, isActive: true });
  };

  const preValidateAccountUpdate = () => {
    // Pre-validation: Check if we're trying to deactivate an account with positive balance
    // Use the updated balance from form data, not the original account balance
    const updatedBalance = parseFloat(formData.balance) || 0;
    if (formData.isActive === false && updatedBalance > 0) {
      setServerError({
        show: true, 
        message: "Cannot deactivate account with positive balance. Please transfer funds or update balance to zero before deactivating.", 
        type: 'warning'
      });
      return false;
    }
    return true;
  };

  const generateRandomOwnerId = () => {
    const newOwnerId = (Math.floor(Math.random() * 900000) + 100000).toString().padStart(6, '0');
    setFormData({ ...formData, ownerId: newOwnerId });
    setTouched({ ...touched, ownerId: false });
    setErrors({ ...errors, ownerId: "" });
  };

  const validateForm = () => {
    const isOwnerIdValid = isEditing || validateField("ownerId", formData.ownerId);
    const isHolderValid = validateField("accountHolder", formData.accountHolder);
    const isBalanceValid = validateField("balance", formData.balance);
    
    setTouched({
      ...(isEditing ? {} : { ownerId: true }),
      accountHolder: true,
      balance: true,
    });

    return isOwnerIdValid && isHolderValid && isBalanceValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError({show: false, message: '', type: 'error'});

    if (!validateForm()) {
      return;
    }

    // Pre-validate before making API call
    if (isEditing && !preValidateAccountUpdate()) {
      return;
    }

    setIsSubmitting(true);
    dispatch(
      setLoading({ key: isEditing ? "accounts" : "createAccount", value: true })
    );

    try {
      if (isEditing && account) {
        // For editing, send updated fields including balance and currency
        const updateData = {
          accountHolder: formData.accountHolder.trim(),
          balance: parseFloat(formData.balance),
          currency: formData.currency,
          isActive: formData.isActive,
        };

        try {
          const response = await fetch(`/api/accounts/${account.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });

          const data = await response.json();

          if (data.success) {
            dispatch(
              updateAccount({
                id: account.id,
                updates: {
                  ...updateData,
                  updatedAt: data.data.updatedAt,
                },
              })
            );
            
            // Success: Close form and refresh data
            onSuccess?.();
            onClose();
          } else {
            // Handle unexpected backend errors (shouldn't happen with pre-validation)
            const errorMessage = data.error || "Failed to update account";
            setServerError({show: true, message: errorMessage, type: 'error'});
            dispatch(setError(data.error || "Failed to update account"));
          }
        } catch (fetchError) {
          console.error("Network error during account update:", fetchError);
          setServerError({show: true, message: "Network error occurred while updating account. Please try again.", type: 'error'});
          dispatch(setError("Network error occurred while updating account"));
        }
      } else {
        // For creating, send all required fields including ownerId
        const createData = {
          ownerId: formData.ownerId,
          accountHolder: formData.accountHolder.trim(),
          accountType: formData.accountType,
          initialBalance: parseFloat(formData.balance),
          currency: formData.currency,
        };

        try {
          const response = await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createData),
          });

          const data = await response.json();

          if (data.success) {
            const newAccount: BankAccount = {
              ...data.data,
              createdAt: data.data.createdAt,
              updatedAt: data.data.updatedAt,
            };
            dispatch(addAccount(newAccount));
            onSuccess?.();
            onClose();
          } else {
            // Handle specific backend errors for account creation with modal
            const errorMessage = data.error || "Failed to create account";
            
            if (errorMessage.includes("Owner ID already exists") || errorMessage.includes("duplicate")) {
              setServerError({show: true, message: t("ownerIdExists"), type: 'error'});
            } else if (errorMessage.includes("Invalid currency")) {
              setServerError({show: true, message: t("invalidCurrency"), type: 'error'});
            } else if (errorMessage.includes("Invalid account type")) {
              setServerError({show: true, message: t("invalidAccountType"), type: 'error'});
            } else if (errorMessage.includes("Balance too low")) {
              setServerError({show: true, message: "Initial balance is too low for this account type", type: 'warning'});
            } else {
              setServerError({show: true, message: errorMessage, type: 'error'});
            }
            
            dispatch(setError(data.error || "Failed to create account"));
          }
        } catch (fetchError) {
          console.error("Network error during account creation:", fetchError);
          setServerError({show: true, message: "Network error occurred while creating account. Please try again.", type: 'error'});
          dispatch(setError("Network error occurred while creating account"));
        }
      }
    } catch (generalError) {
      console.error("Unexpected error in account form:", generalError);
      setServerError({show: true, message: "An unexpected error occurred. Please try again.", type: 'error'});
      dispatch(setError("An unexpected error occurred"));
    } finally {
      setIsSubmitting(false);
      dispatch(
        setLoading({
          key: isEditing ? "accounts" : "createAccount",
          value: false,
        })
      );
    }
  };

  const getFieldIcon = (field: string) => {
    if (!touched[field]) return null;
    return errors[field] ? (
      <AlertTriangle className="h-4 w-4 text-destructive" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {isEditing ? t("editAccount") : t("createNewAccount")}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing && account && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t("currentAccount")}</span>
                  <span className="text-xs text-muted-foreground">#{account.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{account.accountHolder}</span>
                  <span className="font-semibold">{formatCurrencyWithSymbol(account.balance, account.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                  <span>{t(account.accountType)} • {account.currency}</span>
                  <span>{account.isActive ? t("active") : t("inactive")}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owner ID - Only for new accounts */}
              {!isEditing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="ownerId" className="text-sm font-medium">
                      {t("ownerId")} *
                    </Label>
                    {getFieldIcon("ownerId")}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="ownerId"
                      value={formData.ownerId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 6) {
                          handleFieldChange("ownerId", value);
                        }
                      }}
                      onBlur={() => setTouched({ ...touched, ownerId: true })}
                      placeholder="123456"
                      className={`flex-1 ${errors.ownerId ? "border-destructive" : ""}`}
                      maxLength={6}
                      disabled={true}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomOwnerId}
                      className="shrink-0 cursor-pointer"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t("generate")}
                    </Button>
                  </div>
                  {errors.ownerId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.ownerId}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("uniqueIdentifierOwner")}
                  </p>
                </div>
              )}

              {/* Account Holder */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="accountHolder" className="text-sm font-medium">
                    {t("accountHolderName")} *
                  </Label>
                  {getFieldIcon("accountHolder")}
                </div>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder}
                  onChange={(e) => handleFieldChange("accountHolder", e.target.value)}
                  onBlur={() => setTouched({ ...touched, accountHolder: true })}
                  placeholder={t("enterFullName")}
                  className={`w-full ${errors.accountHolder ? "border-destructive" : ""}`}
                  maxLength={100}
                />
                {errors.accountHolder && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.accountHolder}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.accountHolder.length}/100 {t("characters")}
                </p>
              </div>

              {/* Account Type - Only for new accounts */}
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="accountType" className="text-sm font-medium">{t("accountType")} *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value: string) =>
                      handleFieldChange("accountType", value as AccountType)
                    }
                  >
                    <SelectTrigger id="accountType" className="w-full cursor-pointer">
                      <SelectValue 
                        placeholder={t("selectAccountType")}
                        displayValue={(() => {
                          const selectedType = accountTypes.find(type => type.value === formData.accountType);
                          return selectedType ? selectedType.label : undefined;
                        })()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Balance - Allow editing for both new and existing accounts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="balance" className="text-sm font-medium">
                    {isEditing ? t("balance") : t("initialBalance")} *
                  </Label>
                  {getFieldIcon("balance")}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="balance"
                    type="text"
                    inputMode="decimal"
                    value={formData.balance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = value.split(".");
                      if (parts.length > 2) return;
                      if (parts[1] && parts[1].length > 2) return;
                      handleFieldChange("balance", value);
                    }}
                    onBlur={() => setTouched({ ...touched, balance: true })}
                    placeholder="0.00"
                    className={`w-full ${errors.balance ? "border-destructive" : ""}`}
                    style={{
                      paddingLeft: `${Math.max(getCurrencySymbol(formData.currency).length * 8 + 24, 40)}px`
                    }}
                  />
                </div>
                {errors.balance && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.balance}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {isEditing ? t("currentAccountBalance") : `${t("maximum")}: $1,000,000`}
                </p>
              </div>

              {/* Currency - Allow editing for both new and existing accounts */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">{t("currency")} *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: string) =>
                    handleFieldChange("currency", value)
                  }
                >
                  <SelectTrigger id="currency" className="w-full cursor-pointer">
                    <SelectValue 
                      placeholder={t("selectCurrency")}
                      displayValue={(() => {
                        const selectedCurrency = supportedCurrencies.find(currency => currency.value === formData.currency);
                        return selectedCurrency ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedCurrency.label}</span>
                            <span className="text-sm text-muted-foreground">
                              {selectedCurrency.description}
                            </span>
                          </div>
                        ) : undefined;
                      })()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedCurrencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currency.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {currency.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status - Only for editing */}
              {isEditing && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("accountStatus")}</Label>
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={handleStatusChange}
                      label={formData.isActive ? t("active") : t("inactive")}
                      description={
                        formData.isActive
                          ? t("accountActiveTransactions")
                          : t("accountDisabledCannot")
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("saving")
                    : isEditing
                    ? t("updateAccount")
                    : t("createAccount")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Deactivation Warning Modal */}
      <WarningModal
        open={showDeactivationWarning}
        onOpenChange={setShowDeactivationWarning}
        type="warning"
        title={t("deactivateAccountWithBalance")}
        description={t("balanceDeactivateWarning", { balance: account ? formatCurrencyWithSymbol(account.balance, account.currency) : '' })}
        onConfirm={handleConfirmDeactivation}
        onCancel={handleCancelDeactivation}
        confirmText={t("deactivateAccount")}
        cancelText={t("keepActive")}
      />

      {/* Server Error Modal */}
      <WarningModal
        open={serverError.show}
        onOpenChange={(open) => setServerError({...serverError, show: open})}
        type={serverError.type}
        title={serverError.type === 'warning' ? t("operationNotAllowed") : t("serverError")}
        description={serverError.message}
        onConfirm={() => setServerError({show: false, message: '', type: 'error'})}
        confirmText={t("ok")}
        showCancel={false}
      />
    </>
  );
}
