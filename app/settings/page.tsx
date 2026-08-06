"use client";

import React, { useEffect, useState } from "react";
import {
  Key,
  Volume2,
  Moon,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Wallet,
  Globe,
  MapPin,
  Shield,
  User as UserIcon,
  Speaker,
  Mic
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COUNTRIES = [
  { name: "Nigeria", code: "+234" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Canada", code: "+1" },
  { name: "Ghana", code: "+233" },
  { name: "Kenya", code: "+254" },
  { name: "South Africa", code: "+27" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "Australia", code: "+61" },
  { name: "India", code: "+91" },
];

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Arabic",
  "Mandarin Chinese",
];

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  // Existing states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioApiKeySid, setTwilioApiKeySid] = useState("");
  const [twilioApiKeySecret, setTwilioApiKeySecret] = useState("");
  const [twilioTwimlAppSid, setTwilioTwimlAppSid] = useState("");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState("");
  const [showTwilioSaved, setShowTwilioSaved] = useState(false);
  const [savingTwilio, setSavingTwilio] = useState(false);

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceCurrency, setBalanceCurrency] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  // Added new features & dialog states requested
  const [defaultCountry, setDefaultCountry] = useState("Nigeria (+234)");
  const [language, setLanguage] = useState("English");
  
  // Notification sub-toggles
  const [missedCallNotifs, setMissedCallNotifs] = useState(true);
  const [incomingCallUI, setIncomingCallUI] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);

  // Dialog modals
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  // Audio test states
  const [speakerVolume, setSpeakerVolume] = useState("80");
  const [micSensitivity, setMicSensitivity] = useState("Normal");
  const [audioTested, setAudioTested] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      setUserName(user.user_metadata?.full_name ?? "Guest");
      setUserEmail(user.email ?? "");
      setAvatarUrl(user.user_metadata?.avatar_url ?? null);

      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settings) {
        setTwilioAccountSid(settings.twilio_account_sid ?? "");
        setTwilioAuthToken(settings.twilio_auth_token ?? "");
        setTwilioApiKeySid(settings.twilio_api_key_sid ?? "");
        setTwilioApiKeySecret(settings.twilio_api_key_secret ?? "");
        setTwilioTwimlAppSid(settings.twilio_twiml_app_sid ?? "");
        setTwilioPhoneNumber(settings.twilio_phone_number ?? "");
      }
    }
    load();
  }, [supabase]);

  const userInitial = userName.charAt(0).toUpperCase();

  const handleSaveTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTwilio(true);
    setBalanceError("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSavingTwilio(false);
      return;
    }

    const { error } = await supabase.from("settings").upsert(
      {
        user_id: userId,
        twilio_account_sid: twilioAccountSid || null,
        twilio_auth_token: twilioAuthToken || null,
        twilio_api_key_sid: twilioApiKeySid || null,
        twilio_api_key_secret: twilioApiKeySecret || null,
        twilio_twiml_app_sid: twilioTwimlAppSid || null,
        twilio_phone_number: twilioPhoneNumber || null,
      },
      { onConflict: "user_id" }
    );

    if (!error) {
      setShowTwilioSaved(true);
      setTimeout(() => setShowTwilioSaved(false), 2000);
    } else {
      alert("Failed to save Twilio settings: " + error.message);
    }
    setSavingTwilio(false);
  };

  const handleCheckBalance = async () => {
    setCheckingBalance(true);
    setBalanceError("");
    setBalance(null);

    const res = await fetch("/api/twilio/balance");
    const data = await res.json();

    if (!res.ok) {
      setBalanceError(data.error ?? "Failed to fetch balance");
    } else {
      setBalance(data.balance);
      setBalanceCurrency(data.currency);
    }
    setCheckingBalance(false);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleTestAudio = () => {
    setAudioTested(true);
    setTimeout(() => setAudioTested(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        <div className="px-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>

        {/* Profile Card linking to separate profile screen */}
        <div
          onClick={() => router.push('/profile')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">{userEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              PRO
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Twilio Settings Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Twilio Configuration</span>
            </div>
            {twilioAccountSid && twilioAuthToken && (
              <button
                type="button"
                onClick={handleCheckBalance}
                disabled={checkingBalance}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                <Wallet className="w-3.5 h-3.5" />
                {checkingBalance ? "Checking..." : "Check Balance"}
              </button>
            )}
          </div>

          {balance !== null && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-3 py-2">
              Balance: {balance} {balanceCurrency}
            </div>
          )}
          {balanceError && (
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-xl px-3 py-2">
              {balanceError}
            </div>
          )}

          <form onSubmit={handleSaveTwilio} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Account SID</label>
              <input
                type="text"
                value={twilioAccountSid}
                onChange={(e) => setTwilioAccountSid(e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Auth Token</label>
              <input
                type="password"
                value={twilioAuthToken}
                onChange={(e) => setTwilioAuthToken(e.target.value)}
                placeholder="Used for balance & account lookups"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">API Key SID</label>
              <input
                type="text"
                value={twilioApiKeySid}
                onChange={(e) => setTwilioApiKeySid(e.target.value)}
                placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">API Key Secret</label>
              <input
                type="password"
                value={twilioApiKeySecret}
                onChange={(e) => setTwilioApiKeySecret(e.target.value)}
                placeholder="Used to sign call access tokens"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">TwiML App SID</label>
              <input
                type="text"
                value={twilioTwimlAppSid}
                onChange={(e) => setTwilioTwimlAppSid(e.target.value)}
                placeholder="APxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Twilio Phone Number</label>
              <input
                type="text"
                value={twilioPhoneNumber}
                onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                placeholder="+16403564669"
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
                disabled={savingTwilio}
                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {savingTwilio ? "Saving..." : "Save Twilio Keys"}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-2 shadow-sm flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* Audio Settings */}
          <div 
            onClick={() => setAudioDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
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

          {/* Dark Mode */}
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

          {/* Default Country Selector */}
          <div className="flex items-center justify-between p-3.5 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Default Country</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Primary country code</span>
              </div>
            </div>
            <select
              value={defaultCountry}
              onChange={(e) => setDefaultCountry(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none shrink-0 max-w-[145px]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={`${c.name} (${c.code})`}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between p-3.5 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Language</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Display language</span>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none shrink-0 max-w-[130px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Notifications Section */}
          <div className="p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
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

            {/* Sub-notification toggles */}
            <div className="pl-9 flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Missed call notifications</span>
                <input 
                  type="checkbox" 
                  checked={missedCallNotifs} 
                  onChange={() => setMissedCallNotifs(!missedCallNotifs)}
                  className="accent-blue-600 rounded w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Incoming call UI</span>
                <input 
                  type="checkbox" 
                  checked={incomingCallUI} 
                  onChange={() => setIncomingCallUI(!incomingCallUI)}
                  className="accent-blue-600 rounded w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Message notifications</span>
                <input 
                  type="checkbox" 
                  checked={messageNotifs} 
                  onChange={() => setMessageNotifs(!messageNotifs)}
                  className="accent-blue-600 rounded w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Privacy Modal Trigger */}
          <div 
            onClick={() => setPrivacyDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Privacy</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Data protection and terms</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          </div>

          {/* About Dialog Trigger */}
          <div 
            onClick={() => setAboutDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
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

        <button
          onClick={() => setLogoutDialogOpen(true)}
          className="w-full bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/40 transition-all active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

        {/* Audio Test Modal */}
        <Dialog open={audioDialogOpen} onOpenChange={setAudioDialogOpen}>
          <DialogContent className="sm:max-w-xs rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6">
            <DialogHeader className="gap-1.5 mb-2">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-500" /> Audio Settings & Tests
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Test your speakers and microphone before starting calls.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 my-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Speaker className="w-3.5 h-3.5 text-slate-400" /> Speaker Volume ({speakerVolume}%)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={speakerVolume} 
                  onChange={(e) => setSpeakerVolume(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-slate-400" /> Microphone Gain
                </label>
                <select 
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
                  {audioTested ? "✓ Audio test successful!" : "Click below to test audio hardware"}
                </span>
                <Button 
                  onClick={handleTestAudio} 
                  size="sm"
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Run Test Tone
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={() => setAudioDialogOpen(false)}
                className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-2"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Privacy Modal */}
        <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
          <DialogContent className="sm:max-w-xs rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6">
            <DialogHeader className="gap-1.5 mb-2">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-500" /> Privacy & Security
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Your data security and compliance overview.
              </DialogDescription>
            </DialogHeader>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
              <p>JML Dialer encrypts all stored credentials securely in Supabase with row-level security (RLS).</p>
              <p>Call logs and Twilio keys are handled securely and never shared with third parties.</p>
            </div>
            <DialogFooter className="mt-4">
              <Button 
                onClick={() => setPrivacyDialogOpen(false)}
                className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-2"
              >
                Got It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* About Modal */}
        <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
          <DialogContent className="sm:max-w-xs rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6 text-center">
            <div className="flex flex-col items-center gap-2 my-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                JML
              </div>
              <DialogHeader className="items-center gap-1">
                <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  JML Dialer
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Version 1.0.0 (MVP Build)
                </DialogDescription>
              </DialogHeader>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Designed for streamlined WebRTC calling and direct Twilio integration workflows.
            </p>
            <DialogFooter className="!mx-0 !w-full">
              <Button 
                onClick={() => setAboutDialogOpen(false)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent
            className="sm:max-w-xs rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-0 gap-0 overflow-hidden"
            showCloseButton={false}
          >
            <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <DialogHeader className="items-center gap-1.5">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Log out of JML Dialer?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
                  You'll need to sign in again to access your dialer, contacts, and call history.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="!mx-0 !mb-0 !rounded-none !border-t-0 bg-transparent p-4 pt-0 flex flex-col gap-2 sm:flex-col">
              <Button onClick={confirmLogout} className="w-full rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 h-auto">
                Log Out
              </Button>
              <DialogClose
                render={<Button variant="ghost" className="w-full rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 py-2.5 h-auto" />}
              >
                Cancel
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}