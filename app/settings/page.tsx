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
  MapPin,
  Globe,
  Sliders,
  Mic,
  Speaker
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

// Comprehensive country and language list
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
  { name: "United Arab Emirates", code: "+971" },
];

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Arabic",
  "Mandarin Chinese",
  "Hindi"
];

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Notification sub-states
  const [missedCallNotifs, setMissedCallNotifs] = useState(true);
  const [incomingCallUI, setIncomingCallUI] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  // Audio testing states
  const [speakerVolume, setSpeakerVolume] = useState("80");
  const [micSensitivity, setMicSensitivity] = useState("Normal");
  const [audioTested, setAudioTested] = useState(false);

  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // States for Country and Language
  const [defaultCountry, setDefaultCountry] = useState("Nigeria (+234)");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(data.user?.user_metadata?.full_name ?? "Guest");
      setUserEmail(data.user?.email ?? "");
      setAvatarUrl(data.user?.user_metadata?.avatar_url ?? null);
    });
  }, [supabase]);

  const userInitial = userName.charAt(0).toUpperCase();

  const [twilioAccountSid, setTwilioAccountSid] = useState("ACxxxxxxxxxxxxxxxxxxxxxxxx");
  const [twilioAuthToken, setTwilioAuthToken] = useState("••••••••••••••••");
  const [showTwilioSaved, setShowTwilioSaved] = useState(false);

  const handleSaveTwilio = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTwilioSaved(true);
    setTimeout(() => setShowTwilioSaved(false), 2000);
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

        {/* Profile Card */}
        <div 
          onClick={() => router.push('/profile')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{userName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{userEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              PRO
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
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

          {/* Default Country */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Country</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Set primary country code</span>
              </div>
            </div>
            <select
              value={defaultCountry}
              onChange={(e) => setDefaultCountry(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[150px]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={`${c.name} (${c.code})`}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Language</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Select display language</span>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[130px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Notifications Sub-Section */}
          <div className="p-3.5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Configure alert preferences</span>
              </div>
            </div>

            <div className="pl-9 flex flex-col gap-3">
              {/* Missed Call Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Missed call notifications</span>
                <button
                  type="button"
                  onClick={() => setMissedCallNotifs(!missedCallNotifs)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    missedCallNotifs ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      missedCallNotifs ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Incoming Call UI */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Incoming call UI</span>
                <button
                  type="button"
                  onClick={() => setIncomingCallUI(!incomingCallUI)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    incomingCallUI ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      incomingCallUI ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Message Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Message notifications</span>
                <button
                  type="button"
                  onClick={() => setMessageNotifs(!messageNotifs)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    messageNotifs ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      messageNotifs ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* About JML Connect */}
          <div 
            onClick={() => setAboutDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">About JML Connect</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Version 1.0.0 (MVP Build)</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          </div>

        </div>

        {/* Logout Button */}
        <button
          onClick={() => setLogoutDialogOpen(true)}
          className="w-full bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/40 transition-all active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

        {/* Audio Settings Dialog Modal */}
        <Dialog open={audioDialogOpen} onOpenChange={setAudioDialogOpen}>
          <DialogContent className="sm:max-w-sm rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6">
            <DialogHeader className="gap-1 mb-4">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Audio & Device Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Manage your microphone, speakers, and run quick call tests.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
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

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-slate-400" /> Microphone Gain
                </label>
                <select 
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Low">Low (Quiet Environment)</option>
                  <option value="Normal">Normal (Default)</option>
                  <option value="High">High (Boosted Sensitivity)</option>
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
                  {audioTested ? "🔊 Playing test chime..." : "Test your audio hardware setup"}
                </span>
                <Button 
                  onClick={handleTestAudio}
                  size="sm"
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Run Audio Test
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button 
                onClick={() => setAudioDialogOpen(false)}
                className="w-full rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-2.5 h-auto"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* About JML Connect Dialog Modal */}
        <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
          <DialogContent className="sm:max-w-sm rounded-3xl border-slate-200/80 dark:border-slate-800 dark:bg-slate-900 p-6 text-center">
            <div className="flex flex-col items-center gap-3 my-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                JML
              </div>
              <DialogHeader className="items-center gap-1">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  JML Connect
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Version 1.0.0 (MVP Build)
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="text-left bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
              Built for seamless communication and real-time calling workflows powered by WebRTC and Twilio integration. Developed with modern design standards.
            </div>

            <DialogFooter className="!mx-0 !w-full">
              <Button 
                onClick={() => setAboutDialogOpen(false)}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 h-auto"
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
                  Log out of JML Connect?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
                  You'll need to sign in again to access your dialer, contacts, and call history.
                </DialogDescription>
              </DialogHeader>
            </div>

            <DialogFooter className="!mx-0 !mb-0 !rounded-none !border-t-0 bg-transparent p-4 pt-0 flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={confirmLogout}
                className="w-full rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 h-auto"
              >
                Log Out
              </Button>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    className="w-full rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 py-2.5 h-auto"
                  />
                }
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