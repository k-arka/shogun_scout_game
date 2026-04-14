/**
 * Root layout — injects ThemeWrapper (reads nuqs ?theme param),
 * loads Japanese fonts, and wraps TanStack Query provider.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import ThemeWrapper from "@/components/ThemeWrapper";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Shogun's Scout — Tactical RPG Scavenger Hunt",
  description:
    "Navigate a 100×100 samurai-era grid, unmask 5 hidden spies, and claim victory for the Shogunate.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col">
        <NuqsAdapter>
          <QueryProvider>
            <Suspense fallback={null}>
              <ThemeWrapper>{children}</ThemeWrapper>
            </Suspense>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
