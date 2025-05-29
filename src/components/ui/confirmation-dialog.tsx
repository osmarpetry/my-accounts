"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const variantIcons = {
  default: CheckCircle,
  destructive: XCircle,
  warning: AlertTriangle,
};

const variantColors = {
  default: "text-primary",
  destructive: "text-destructive",
  warning: "text-yellow-500",
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationDialogProps) {
  const Icon = variantIcons[variant];
  const iconColor = variantColors[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${iconColor}`} />
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy usage
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning";
    onConfirm: () => void;
    onCancel?: () => void;
    loading?: boolean;
  } | null>(null);

  const showConfirmation = (config: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning";
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setDialogState({
      open: true,
      ...config,
      loading: false,
    });
  };

  const closeDialog = () => {
    setDialogState(null);
  };

  const setLoading = (loading: boolean) => {
    if (dialogState) {
      setDialogState({ ...dialogState, loading });
    }
  };

  const dialogProps = dialogState
    ? {
        ...dialogState,
        onOpenChange: (open: boolean) => {
          if (!open) closeDialog();
        },
      }
    : null;

  return {
    showConfirmation,
    closeDialog,
    setLoading,
    dialogProps,
    ConfirmationDialog: dialogProps ? (
      <ConfirmationDialog {...dialogProps} />
    ) : null,
  };
}
