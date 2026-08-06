"use client";

import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import BottomNavigation from "@/components/common/BottomNavigation";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isChatDetailPage = pathname?.startsWith("/messages/") && pathname.split("/").length > 2;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            {!isLoginPage && !isChatDetailPage && <BottomNavigation />}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}