"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Speaker,
  Mic,
  HelpCircle,
  Copy,
  ClipboardCheck,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";
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
] as const;

// Your app's live webhook endpoint that handles incoming and outgoing call routing
const TWILIO_WEBHOOK_URL = "https://jml-dialer-haga.vercel.app/api/voice";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

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

  const [defaultCountry, setDefaultCountry] = useState("Nigeria (+234)");

  const [missedCallNotifs, setMissedCallNotifs] = useState(true);
  const [incomingCallUI, setIncomingCallUI] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);

  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);

  const [speakerVolume, setSpeakerVolume] = useState("80");
  const [micSensitivity, setMicSensitivity] = useState("Normal");
  const [audioTested, setAudioTested] = useState(false);
  const [playingTone, setPlayingTone] = useState(false);
  const [micTesting, setMicTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [audioError, setAudioError] = useState("");

  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

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
        setDefaultCountry(settings.country ?? "Nigeria (+234)");
        setNotificationsEnabled(settings.notifications ?? true);
        setMissedCallNotifs(settings.notify_missed_calls ?? true);
        setMessageNotifs(settings.notify_messages ?? true);
      }
    }
    load();

    return () => {
      stopTone();
      stopMicTest();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const userInitial = userName.charAt(0).toUpperCase();

  const savePreference = async (fields: Record<string, any>) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    await supabase.from("settings").upsert(
      { user_id: userId, ...fields },
      { onConflict: "user_id" }
    );
  };

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

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(TWILIO_WEBHOOK_URL);
      setWebhookUrlCopied(true);
      setTimeout(() => setWebhookUrlCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy webhook URL:", err);
    }
  };

  // --- Real audio testing ---
  const playTone = () => {
    setAudioError("");
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      gain.gain.value = Number(speakerVolume) / 100 * 0.3;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      audioContextRef.current = ctx;
      oscillatorRef.current = oscillator;
      setPlayingTone(true);
      setAudioTested(true);

      setTimeout(() => {
        stopTone();
      }, 2000);
    } catch (err: any) {
      setAudioError("Couldn't play test tone: " + err.message);
    }
  };

  const stopTone = () => {
    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    audioContextRef.current?.close();
    oscillatorRef.current = null;
    audioContextRef.current = null;
    setPlayingTone(false);
  };

  const startMicTest = async () => {
    setAudioError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = ctx;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const gainMultiplier = micSensitivity === "High" ? 2 : micSensitivity === "Low" ? 0.5 : 1;

      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicLevel(Math.min(100, avg * gainMultiplier));
        rafRef.current = requestAnimationFrame(update);
      };
      update();

      setMicTesting(true);
    } catch (err: any) {
      setAudioError("Microphone access denied or unavailable: " + err.message);
    }
  };

  const stopMicTest = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    micStreamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    rafRef.current = null;
    setMicTesting(false);
    setMicLevel(0);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        <div className="px-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t("settings")}</h1>
        </div>

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

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t("twilioConfiguration")}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuideDialogOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Setup Guide
              </button>
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
              <button
                type="button"
                onClick={handleCopyWebhookUrl}
                title="Copy webhook URL"
                className="w-full mt-1.5 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Request URL — paste into Twilio TwiML App settings
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                    {TWILIO_WEBHOOK_URL}
                  </span>
                </span>
                {webhookUrlCopied ? (
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                )}
              </button>
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-2 shadow-sm flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">

          <div
            onClick={() => setAudioDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("audioSettings")}</span>
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
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("darkMode")}</span>
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

          <div className="flex items-center justify-between p-3.5 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t("defaultCountry")}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Used as default in dialer</span>
              </div>
            </div>
            <select
              value={defaultCountry}
              onChange={(e) => {
                setDefaultCountry(e.target.value);
                savePreference({ country: e.target.value });
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none shrink-0 max-w-[145px]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={`${c.name} (${c.code})`}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t("language")}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Display language</span>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none shrink-0 max-w-[130px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("notifications")}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Incoming call alerts & badges</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !notificationsEnabled;
                  setNotificationsEnabled(next);
                  savePreference({ notifications: next });
                }}
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

            <div className="pl-9 flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Missed call notifications</span>
                <input
                  type="checkbox"
                  checked={missedCallNotifs}
                  onChange={() => {
                    const next = !missedCallNotifs;
                    setMissedCallNotifs(next);
                    savePreference({ notify_missed_calls: next });
                  }}
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
                  onChange={() => {
                    const next = !messageNotifs;
                    setMessageNotifs(next);
                    savePreference({ notify_messages: next });
                  }}
                  className="accent-blue-600 rounded w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div
            onClick={() => setPrivacyDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("privacy")}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Data protection and terms</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          </div>

          <div
            onClick={() => setAboutDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("about")}</span>
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
          <span>{t("logOut")}</span>
        </button>

        <Dialog
          open={audioDialogOpen}
          onOpenChange={(open) => {
            setAudioDialogOpen(open);
            if (!open) {
              stopTone();
              stopMicTest();
              setAudioTested(false);
            }
          }}
        >
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
                <Button
                  onClick={playTone}
                  disabled={playingTone}
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold mt-1"
                >
                  {playingTone ? "Playing tone..." : "Play Test Tone"}
                </Button>
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

                {micTesting && (
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                )}

                <Button
                  onClick={micTesting ? stopMicTest : startMicTest}
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl text-xs font-semibold mt-1"
                >
                  {micTesting ? "Stop Mic Test" : "Test Microphone"}
                </Button>
              </div>

              {audioError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl px-3 py-2">
                  {audioError}
                </div>
              )}

              {audioTested && !audioError && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Speaker test successful!</span>
                </div>
              )}
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

        <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
          <DialogContent className="sm:max-w-sm rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="gap-1.5 mb-2">
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> JML Connect & Twilio Setup Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Follow these steps to connect your Twilio account and configure your webhooks.
              </DialogDescription>
            </DialogHeader>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 my-2">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Step 1: Get your Twilio Credentials</p>
                <ol className="list-decimal list-outside pl-4 space-y-1">
                  <li>Log into your Twilio Console.</li>
                  <li>From the dashboard home page, copy your Account SID and Auth Token.</li>
                  <li>Paste them into the corresponding fields in your JML Dialer settings.</li>
                </ol>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Step 2: Create a TwiML App</p>
                <ol className="list-decimal list-outside pl-4 space-y-1">
                  <li>In your Twilio Console, navigate to Voice &gt; TwiML &gt; TwiML Apps.</li>
                  <li>Click Create new TwiML App (or select an existing one).</li>
                  <li>Give your application a friendly name (e.g., JML Dialer App).</li>
                </ol>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Step 3: Configure the Request URL</p>
                <p className="mb-1.5">Paste this exact URL into the Request URL field inside your Twilio TwiML App settings:</p>
                <button
                  type="button"
                  onClick={handleCopyWebhookUrl}
                  className="w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                    {TWILIO_WEBHOOK_URL}
                  </span>
                  {webhookUrlCopied ? (
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  )}
                </button>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  This is your app's live webhook endpoint that handles incoming and outgoing call routing.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Step 4: Save and Get your TwiML App SID</p>
                <ol className="list-decimal list-outside pl-4 space-y-1">
                  <li>Save your TwiML App configuration in Twilio.</li>
                  <li>Copy the generated TwiML App SID (which always starts with AP).</li>
                  <li>Paste that AP... value into the TwiML App SID field in JML Connect.</li>
                </ol>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                onClick={() => setGuideDialogOpen(false)}
                className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-2"
              >
                Got It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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