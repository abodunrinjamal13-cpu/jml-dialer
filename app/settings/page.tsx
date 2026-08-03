"use client";

import React, { useState } from "react";
import {
  Key,
  Volume2,
  Moon,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Check
} from "lucide-react";
import { useTheme } from "../ThemeContext";

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userName = "Jamal";
  const userEmail = "jamal@jmldialer.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const [twilioAccountSid, setTwilioAccountSid] = useState("ACxxxxxxxxxxxxxxxxxxxxxxxx");
  const [twilioAuthToken, setTwilioAuthToken] = useState("••••••••••••••••");
  const [showTwilioSaved, setShowTwilioSaved] = useState(false);

  const handleSaveTwilio = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTwilioSaved(true);
    setTimeout(() => setShowTwilioSaved(false), 2000);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        <div className="px-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
              {userInitial}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{userName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{userEmail}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
            PRO
          </span>
        </div>

        {/* Twilio Settings Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Twilio Configuration</span>
          </div>

          <form onSubmit={handleSaveTwilio} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Account SID</label>
              <input
                type="text"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Auth Token</label>
              <input
                type="password"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium min-h-[1.25rem]">
                {showTwilioSaved && (
                  <>
                    <Check className="w-3.5 h-3.5" /> Saved successfully
                  </>
                )}
              </span>
              <button
                type="submit"
                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Save Twilio Keys
              </button>
            </div>
          </form>
        </div>

        {/* Preferences List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-2 shadow-sm flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Audio Settings</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Ringtone, mic, speaker tests</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Mode</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Toggle dark theme interface</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                isDarkMode ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Incoming call alerts & badges</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                notificationsEnabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">About JML Dialer</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Version 1.0.0 (MVP Build)</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/40 transition-all active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}