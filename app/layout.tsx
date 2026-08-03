"use client";

import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
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
          {children}
          {!isLoginPage && !isChatDetailPage && <BottomNavigation />}
        </ThemeProvider>
      </body>
    </html>
  );
}