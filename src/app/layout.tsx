import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/redux-provider";
import { LayoutClient } from "@/components/layout-client";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased theme-transition`}
      >
        <ReduxProvider>
          <ThemeProvider defaultTheme="system">
            <ErrorBoundary>
              <div className="min-h-screen bg-background">
                <header className="bg-card shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-foreground">
                          Bank Management System
                        </h1>
                      </div>
                      <LayoutClient />
                    </div>
                  </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
