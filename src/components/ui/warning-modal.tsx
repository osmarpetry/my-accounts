"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export type ModalType = "warning" | "error" | "info" | "success";

interface WarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: ModalType;
  title: string;
  description: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  showCancel?: boolean;
}

const getIcon = (type: ModalType) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
};

const getButtonVariant = (type: ModalType) => {
  switch (type) {
    case "error":
      return "destructive";
    case "warning":
      return "default";
    case "info":
      return "default";
    case "success":
      return "default";
    default:
      return "default";
  }
};

export function WarningModal({
  open,
  onOpenChange,
  type = "warning",
  title,
  description,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  loading = false,
  showCancel = true,
}: WarningModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getIcon(type)}
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 pt-0">
          {showCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              {cancelText || t("cancel")}
            </Button>
          )}
          <Button
            variant={getButtonVariant(type)}
            onClick={handleConfirm}
            disabled={loading}
            className={showCancel ? "flex-1" : "w-full"}
          >
            {loading 
              ? t("processing") 
              : confirmText || (onConfirm ? t("confirm") : t("ok"))
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 