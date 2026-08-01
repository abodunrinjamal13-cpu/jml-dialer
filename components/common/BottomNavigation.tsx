"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, History, MessageSquare, Users, Settings } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dialer", href: "/dialer", icon: Phone },
    { label: "History", href: "/history", icon: History },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Contacts", href: "/contacts", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 flex justify-center items-center z-50 px-3">
      <nav className="bg-white/95 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 backdrop-blur-md border border-slate-200/80 dark:border-indigo-400/30 shadow-lg rounded-full px-7 py-2 flex items-center justify-between gap-7 sm:gap-12 w-full max-w-sm transition-all duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "text-blue-600 dark:text-white font-semibold"
                  : "text-slate-400 dark:text-indigo-200 hover:text-slate-600 dark:hover:text-white"
              }`}
            >
              <div
                className={`p-2 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-blue-600 dark:bg-white text-white dark:text-indigo-600 shadow-sm shadow-blue-300 dark:shadow-none"
                    : "bg-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNavigation;