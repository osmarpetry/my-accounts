import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/redux-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { LayoutClient } from "@/components/layout-client";
import { MSWProvider } from "@/components/msw-provider";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bank Accounts Management System",
  description:
    "A modern bank accounts management application built with Next.js 15, TypeScript, and Tailwind CSS",
  keywords: [
    "bank",
    "accounts",
    "management",
    "nextjs",
    "typescript",
    "tailwind",
  ],
  authors: [{ name: "Bank Management Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <MSWProvider>
        <I18nProvider>
          <ReduxProvider>
            <ThemeProvider defaultTheme="system">
              <ToastProvider>
                <ErrorBoundary>
                  <div className="min-h-screen bg-background">
                    <header className="bg-card shadow-sm border-b">
                      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                        <div className="flex justify-between items-center h-14 sm:h-16">
                          <div className="flex items-center min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                              <Link href="/" className="hover:opacity-80 transition-opacity">
                                <span className="hidden sm:inline">Bank Management System</span>
                                <span className="sm:hidden">Bank System</span>
                              </Link>
                            </h1>
                          </div>
                          <div className="flex-shrink-0">
                            <LayoutClient />
                          </div>
                        </div>
                      </div>
                    </header>
                    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                      {children}
                    </main>
                  </div>
                </ErrorBoundary>
              </ToastProvider>
            </ThemeProvider>
          </ReduxProvider>
        </I18nProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
