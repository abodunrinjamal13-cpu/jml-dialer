"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "@/components/common/BottomNavigation";

export default function ClientBottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return <BottomNavigation />;
}