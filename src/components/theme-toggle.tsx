"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-4 w-4 animate-pulse bg-current rounded" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 relative overflow-hidden group"
    >
      <div className="relative flex items-center justify-center">
        <Sun
          className={`h-4 w-4 transition-all duration-500 ${
            isDark
              ? "scale-0 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <Moon
          className={`h-4 w-4 absolute transition-all duration-500 ${
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:via-yellow-400/10 group-hover:to-yellow-400/20 transition-all duration-300" />
    </Button>
  );
}
