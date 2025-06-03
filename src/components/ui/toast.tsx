"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Info, ArrowUp, Check, Trash2, ArrowRightLeft, Plus, Edit } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccessToast: (title: string, description?: string) => void;
  showErrorToast: (title: string, description?: string) => void;
  showInfoToast: (title: string, description?: string) => void;
  showDeleteSuccess: (accountName: string, accountNumber: string) => void;
  showTransferSuccess: (fromAccount: string, toAccount: string, amount: string) => void;
  showCreateSuccess: (accountName: string) => void;
  showUpdateSuccess: (accountName: string) => void;
  showScrollToTop: () => void;
  hideScrollToTop: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Convenience methods for common toast types
  const showSuccessToast = (title: string, description?: string) => {
    addToast({
      type: "success",
      title,
      ...(description && { description }),
      duration: 3000,
    });
  };

  const showErrorToast = (title: string, description?: string) => {
    addToast({
      type: "error",
      title,
      ...(description && { description }),
      duration: 4000,
    });
  };

  const showInfoToast = (title: string, description?: string) => {
    addToast({
      type: "info",
      title,
      ...(description && { description }),
      duration: 3000,
    });
  };

  // Specific action success methods
  const showDeleteSuccess = (accountName: string, accountNumber: string) => {
    addToast({
      type: "success",
      title: `${accountName} #${accountNumber} deleted!`,
      duration: 3000,
    });
  };

  const showTransferSuccess = (fromAccount: string, toAccount: string, amount: string) => {
    addToast({
      type: "success",
      title: `${amount} transferred successfully!`,
      description: `From ${fromAccount} to ${toAccount}`,
      duration: 3500,
    });
  };

  const showCreateSuccess = (accountName: string) => {
    addToast({
      type: "success",
      title: `${accountName} created successfully!`,
      duration: 3000,
    });
  };

  const showUpdateSuccess = (accountName: string) => {
    addToast({
      type: "success",
      title: `${accountName} updated successfully!`,
      duration: 3000,
    });
  };

  const handleShowScrollToTop = () => {
    setShowScrollToTop(true);
  };

  const handleHideScrollToTop = () => {
    setShowScrollToTop(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowScrollToTop(false);
  };

  const getToastIcon = (type: Toast["type"], title: string) => {
    // Determine icon based on action type for success toasts
    if (type === "success") {
      if (title.includes("deleted")) {
        return <Trash2 className="h-4 w-4 text-white" />;
      } else if (title.includes("transferred")) {
        return <ArrowRightLeft className="h-4 w-4 text-white" />;
      } else if (title.includes("created")) {
        return <Plus className="h-4 w-4 text-white" />;
      } else if (title.includes("updated")) {
        return <Edit className="h-4 w-4 text-white" />;
      } else {
        return <Check className="h-4 w-4 text-white" />;
      }
    }
    
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-white" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-white" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-white" />;
    }
  };

  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500 hover:bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/25";
      case "error":
        return "bg-red-500 hover:bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/25";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 border-yellow-400 text-white shadow-lg shadow-yellow-500/25";
      case "info":
      default:
        return "bg-blue-500 hover:bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/25";
    }
  };

  // Only render on client side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ToastContext.Provider value={{ 
        showToast: addToast, 
        showSuccessToast, 
        showErrorToast, 
        showInfoToast,
        showDeleteSuccess,
        showTransferSuccess,
        showCreateSuccess,
        showUpdateSuccess,
        showScrollToTop: handleShowScrollToTop, 
        hideScrollToTop: handleHideScrollToTop 
      }}>
        {children}
      </ToastContext.Provider>
    );
  }

  return (
    <ToastContext.Provider value={{ 
      showToast: addToast, 
      showSuccessToast, 
      showErrorToast, 
      showInfoToast,
      showDeleteSuccess,
      showTransferSuccess,
      showCreateSuccess,
      showUpdateSuccess,
      showScrollToTop: handleShowScrollToTop, 
      hideScrollToTop: handleHideScrollToTop 
    }}>
      {children}
      {createPortal(
        <>
          {/* Toast Notifications */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`
                  flex items-center gap-3 pl-4 pr-3 py-3 rounded-full border backdrop-blur-sm
                  max-w-sm mx-auto animate-in slide-in-from-bottom-5 duration-300
                  transition-all hover:scale-105 cursor-default
                  ${getToastStyles(toast.type)}
                `}
              >
                {getToastIcon(toast.type, toast.title)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate">{toast.title}</div>
                  {toast.description && (
                    <div className="text-xs text-white/90 mt-0.5 truncate">
                      {toast.description}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeToast(toast.id)}
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>


        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
} 