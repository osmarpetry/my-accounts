"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
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
import {
  addAccount,
  updateAccount,
  setLoading,
  setError,
} from "@/store/redux-store";
import { BankAccount, AccountType } from "@/types";
import { X } from "lucide-react";
import { Locale, useTranslation } from "@/lib/i18n";

interface AccountFormProps {
  account?: BankAccount | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  locale: Locale;
}

export function AccountForm({
  account,
  onClose,
  onSuccess,
  locale,
}: AccountFormProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation(locale);
  const isEditing = !!account;

  const accountTypes: { value: AccountType; label: string }[] = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "credit", label: "Credit" },
  ];

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
  ];

  const [formData, setFormData] = useState({
    accountHolder: account?.accountHolder || "",
    accountType: account?.accountType || ("checking" as AccountType),
    balance: account?.balance?.toString() || "0",
    currency: account?.currency || "USD",
    isActive: account?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = t("forms.accountHolderRequired");
    } else if (formData.accountHolder.length < 2) {
      newErrors.accountHolder = t("forms.accountHolderMinLength");
    } else if (!/^[a-zA-Z\s]+$/.test(formData.accountHolder)) {
      newErrors.accountHolder = t("forms.accountHolderInvalid");
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      newErrors.balance = t("forms.balanceInvalid");
    } else if (balance < 0) {
      newErrors.balance = t("forms.balanceNegative");
    } else if (balance > 1000000) {
      newErrors.balance = t("forms.balanceMax");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    dispatch(
      setLoading({ key: isEditing ? "accounts" : "createAccount", value: true })
    );

    try {
      const accountData = {
        accountHolder: formData.accountHolder.trim(),
        accountType: formData.accountType,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        isActive: formData.isActive,
      };

      if (isEditing && account) {
        // Update existing account
        const response = await fetch(`/api/accounts/${account.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountData),
        });

        const data = await response.json();

        if (data.success) {
          dispatch(
            updateAccount({
              id: account.id,
              updates: {
                ...accountData,
                updatedAt: new Date(data.data.updatedAt).toISOString(),
              },
            })
          );
          onSuccess?.();
          onClose();
        } else {
          dispatch(setError(data.error || "Failed to update account"));
        }
      } else {
        // Create new account
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...accountData,
            initialBalance: accountData.balance,
          }),
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
          dispatch(setError(data.error || "Failed to create account"));
        }
      }
    } catch (error) {
      dispatch(setError("Network error occurred"));
      console.error("Account form error:", error);
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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            {isEditing ? t("forms.editAccount") : t("forms.createNewAccount")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountHolder">
                {t("forms.accountHolder")} *
              </Label>
              <Input
                id="accountHolder"
                value={formData.accountHolder}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolder: e.target.value })
                }
                placeholder={t("forms.accountHolder")}
                className={errors.accountHolder ? "border-destructive" : ""}
              />
              {errors.accountHolder && (
                <p className="text-sm text-destructive">
                  {errors.accountHolder}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">{t("forms.accountType")} *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value: string) =>
                  setFormData({
                    ...formData,
                    accountType: value as AccountType,
                  })
                }
              >
                <SelectTrigger
                  id="accountType"
                  aria-label={`${t("forms.accountType")} *`}
                >
                  <SelectValue placeholder={t("forms.accountType")} />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">
                {isEditing ? t("forms.balance") : t("forms.initialBalance")} *
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({ ...formData, balance: e.target.value })
                }
                placeholder="0.00"
                className={errors.balance ? "border-destructive" : ""}
              />
              {errors.balance && (
                <p className="text-sm text-destructive">{errors.balance}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("forms.currency")} *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger
                  id="currency"
                  aria-label={`${t("forms.currency")} *`}
                >
                  <SelectValue placeholder={t("forms.currency")} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  aria-label={t("forms.accountActive")}
                />
                <Label htmlFor="isActive">{t("forms.accountActive")}</Label>
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
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting
                  ? t("forms.saving")
                  : isEditing
                  ? t("forms.updateAccount")
                  : t("forms.createNewAccount")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
