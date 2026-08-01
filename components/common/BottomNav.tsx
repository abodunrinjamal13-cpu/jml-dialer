"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, History, MessageSquare, Users, Settings } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dialer", href: "/dialer", icon: Phone },
    { label: "History", href: "/history", icon: History },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Contacts", href: "/contacts", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center z-50 px-4">
      <nav className="bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg rounded-full px-4 py-1.5 flex items-center gap-3 sm:gap-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all ${
                isActive ? "text-blue-600 font-semibold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div
                className={`p-2 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-300" : "bg-transparent"
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

export default BottomNav;