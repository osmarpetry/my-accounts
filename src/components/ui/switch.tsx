"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, disabled, onCheckedChange, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3">
        <label
          className={cn(
            "relative inline-flex items-center cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className="sr-only peer"
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 bg-muted rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 dark:peer-focus:ring-ring/40 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              className
            )}
          />
        </label>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span
                className={cn(
                  "text-sm font-medium leading-none",
                  disabled && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch }; 