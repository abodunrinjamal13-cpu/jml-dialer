"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "JML Dialer",
  subtitle = "Business Voice Platform",
  userName,
}) => {
  const supabase = createClient();
  const [sessionName, setSessionName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessionName(data.user?.user_metadata?.full_name ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionName(session?.user?.user_metadata?.full_name ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const displayName = userName ?? sessionName ?? "Guest";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-white/90 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-blue-600 backdrop-blur-md border-b border-slate-200/80 dark:border-indigo-400/30 px-4 py-2.5 shadow-xs shrink-0 transition-all duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:bg-none dark:bg-white flex items-center justify-center text-white dark:text-indigo-600 shadow-md transition-colors">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {title}
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-white/20 text-blue-700 dark:text-white border border-blue-200/60 dark:border-white/30 backdrop-blur-xs">
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-white" />
                Connected
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-indigo-100 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-white text-white dark:text-indigo-600 font-bold text-xs flex items-center justify-center shadow-sm border border-blue-500 dark:border-white transition-colors">
          {userInitial}
        </div>
      </div>
    </header>
  );
};