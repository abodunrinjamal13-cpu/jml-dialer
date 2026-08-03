"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Device } from "@twilio/voice-sdk";
import { Header } from "@/components/common/Header";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { StatusCard } from "@/components/dialer/StatusCard";
import { PhoneInput } from "@/components/dialer/PhoneInput";
import { DialPad } from "@/components/dialer/DialPad";
import { CallButton } from "@/components/dialer/CallButton";
import { createClient } from "@/lib/supabase/client";
import { 
  UserPlus, 
  UserCheck, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Volume2, 
  PhoneCall, 
  Grid, 
  CircleDot, 
  FileText, 
  PhoneOff 
} from "lucide-react";

function DialerPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("number");

  const [hasMounted, setHasMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [callState, setCallState] = useState<"Ready" | "Calling" | "Connected" | "End Call">("Ready");
  const [isMinimized, setIsMinimized] = useState(false);

  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [showInCallKeypad, setShowInCallKeypad] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [callNotes, setCallNotes] = useState("");

  // Database-backed contact lookup state
  const [contactInfo, setContactInfo] = useState<{ name: string; title?: string; location?: string } | null>(null);

  // Ensure component only renders after mounting on client to prevent hydration errors
  useEffect(() => {
    setHasMounted(true);
    if (initialNumber) {
      setPhoneNumber(initialNumber);
    }
  }, [initialNumber]);

  // Lookup contact from Supabase whenever phone number changes
  useEffect(() => {
    async function fetchContact() {
      if (!phoneNumber || phoneNumber.length < 3) {
        setContactInfo(null);
        return;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return;

        // Clean number variations for flexible matching (exact, stripped spaces, or suffix matching)
        const cleanedNumber = phoneNumber.replace(/\D/g, "");
        const queryVariants = [
          phoneNumber,
          cleanedNumber,
          `+${cleanedNumber}`,
          cleanedNumber.startsWith("234") ? `0${cleanedNumber.slice(3)}` : null,
          !cleanedNumber.startsWith("234") && cleanedNumber.startsWith("0") ? `234${cleanedNumber.slice(1)}` : null,
        ].filter(Boolean);

        // Build an OR query string for Supabase e.g. phone.eq.08148...,phone.eq.8148...
        const orFilter = queryVariants.map((v) => `phone.eq.${v}`).join(",");

        const { data, error } = await supabase
          .from("contacts")
          .select("name, title, location")
          .eq("user_id", userId)
          .or(orFilter)
          .maybeSingle();

        if (data) {
          setContactInfo(data);
        } else {
          setContactInfo(null);
        }
      } catch (err) {
        console.error("Error fetching contact:", err);
        setContactInfo(null);
      }
    }

    fetchContact();
  }, [phoneNumber, supabase]);

  useEffect(() => {
    if (!hasMounted) return;
    async function initDevice() {
      try {
        const res = await fetch('/api/voice', { method: 'POST' });
        const data = await res.json();
        if (!data.token) return;
        const newDevice = new Device(data.token);
        await newDevice.register();
        setDevice(newDevice);
      } catch (err) {
        console.error('Twilio Device setup error:', err);
      }
    }
    initDevice();
  }, [hasMounted]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall && callState === "Connected") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall, callState]);

  if (!hasMounted) {
    return null;
  }

  const handleKeyPress = (val: string) => {
    if (!isInCall) {
      if (phoneNumber.length < 15) {
        setPhoneNumber((prev) => prev + val);
      }
    } else {
      if (activeCall) {
        activeCall.sendDigits(val);
      }
    }
  };

  const logCallToSupabase = async (durationSecs: number, statusVal: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId || !phoneNumber) return;

      const { data: contactData } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", userId)
        .eq("phone", phoneNumber)
        .maybeSingle();

      await supabase.from("call_history").insert({
        user_id: userId,
        contact_id: contactData ? contactData.id : null,
        direction: "outgoing",
        status: statusVal,
        duration: durationSecs,
        started_at: new Date(Date.now() - durationSecs * 1000).toISOString(),
      });
    } catch (err) {
      console.error("Error logging call history:", err);
    }
  };

  const handleCallToggle = async () => {
    if (!isInCall) {
      if (!device || !phoneNumber) return;
      try {
        setIsInCall(true);
        setIsMinimized(false);
        setCallState("Calling");

        const call = await device.connect({ params: { To: phoneNumber } });
        setActiveCall(call);
        setCallState("Connected");

        call.on('disconnect', () => {
          const finalDuration = callDuration;
          setActiveCall(null);
          setIsInCall(false);
          setIsMinimized(false);
          setCallState("Ready");
          setIsMuted(false);
          setIsOnHold(false);
          setIsRecording(false);
          setShowInCallKeypad(false);
          setShowNotesModal(false);

          logCallToSupabase(finalDuration, "completed");
        });
      } catch (error) {
        console.error("Call failed:", error);
        setIsInCall(false);
        setIsMinimized(false);
        setCallState("Ready");
        logCallToSupabase(0, "missed");
      }
    } else {
      setCallState("End Call");
      const finalDuration = callDuration;
      if (activeCall) {
        activeCall.disconnect();
      }
      setTimeout(() => {
        setActiveCall(null);
        setIsInCall(false);
        setIsMinimized(false);
        setCallState("Ready");
        setIsMuted(false);
        setIsOnHold(false);
        setIsRecording(false);
        setShowInCallKeypad(false);
        setShowNotesModal(false);

        logCallToSupabase(finalDuration, "completed");
      }, 800);
    }
  };

  const handleMinimizeCallScreen = () => setIsMinimized(true);
  const handleRestoreCallScreen = () => setIsMinimized(false);

  const toggleMute = () => {
    if (activeCall) {
      const nextMute = !isMuted;
      activeCall.mute(nextMute);
      setIsMuted(nextMute);
    }
  };

  const toggleHold = () => {
    if (activeCall) {
      setIsOnHold(!isOnHold);
    }
  };

  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);
  const toggleRecord = () => setIsRecording(!isRecording);

  return (
    <div className="suppressHydrationWarning relative h-screen w-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white flex flex-col justify-between items-center select-none transition-colors duration-200 overflow-hidden">
      
      {isInCall && !isMinimized && (
        <div className="absolute inset-0 w-full h-full bg-[#0F1C3F] text-white p-6 flex flex-col justify-between z-[9999]">
          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={handleMinimizeCallScreen}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition text-lg font-bold"
              title="Minimize to Dialer"
            >
              ⌄
            </button>
            <div className="text-white/80 tracking-widest text-sm">•••</div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold">{contactInfo ? contactInfo.name : "Unknown Contact"}</h2>
            <p className="text-white/70 text-sm">{phoneNumber}</p>
            <p className="text-xs text-white/50">{callState === "Connected" ? `Active: ${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}` : "Calling..."}</p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-indigo-500/30 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl">
                {contactInfo ? contactInfo.name[0].toUpperCase() : "👤"}
              </div>
            </div>
            <div className="text-emerald-400 font-mono text-lg font-medium">
              {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
            <button onClick={toggleMute} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </div>
              <span className="text-xs text-white/70">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button onClick={() => setShowInCallKeypad(!showInCallKeypad)} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${showInCallKeypad ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <Grid className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/70">Keypad</span>
            </button>

            <button onClick={toggleSpeaker} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isSpeakerOn ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <Volume2 className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/70">Speaker</span>
            </button>

            <button onClick={toggleHold} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isOnHold ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isOnHold ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </div>
              <span className="text-xs text-white/70">{isOnHold ? 'Unhold' : 'Hold'}</span>
            </button>

            <button onClick={toggleRecord} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <CircleDot className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/70">{isRecording ? 'Recording' : 'Record'}</span>
            </button>

            <button onClick={() => setShowNotesModal(true)} className="flex flex-col items-center space-y-1 group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition ${callNotes ? 'bg-blue-600 text-white shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs text-white/70">Notes</span>
            </button>
          </div>

          <div className="flex justify-center pb-4">
            <button onClick={handleCallToggle} className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-500 transition text-white">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>

          {showInCallKeypad && (
            <div className="absolute inset-x-4 bottom-24 bg-slate-900/95 border border-slate-700 p-4 rounded-3xl shadow-2xl z-50 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/70 font-semibold tracking-wider">DTMF KEYPAD</span>
                <button onClick={() => setShowInCallKeypad(false)} className="text-white/60 hover:text-white text-sm font-bold px-2">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleKeyPress(digit)}
                    className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-lg flex items-center justify-center transition"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showNotesModal && (
            <div className="absolute inset-x-4 top-20 bottom-24 bg-slate-900/95 border border-slate-700 p-5 rounded-3xl shadow-2xl z-50 flex flex-col justify-between backdrop-blur-md">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Call Notes</h3>
                <button onClick={() => setShowNotesModal(false)} className="text-white/60 hover:text-white text-sm font-bold">✕</button>
              </div>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Type quick notes about this conversation..."
                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none mt-3"
              />
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-medium text-sm transition mt-3"
              >
                Save Notes
              </button>
            </div>
          )}
        </div>
      )}

      {isInCall && isMinimized && (
        <div className="absolute top-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div 
            onClick={handleRestoreCallScreen}
            className="pointer-events-auto w-full max-w-sm bg-[#0F1C3F] text-white border border-indigo-500/40 shadow-xl rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#152756] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold leading-tight">Ongoing Call ({contactInfo ? contactInfo.name : phoneNumber})</h4>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Tap to return • {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition">
              Return
            </button>
          </div>
        </div>
      )}

      <Header title="JML Dialer" subtitle="Ready to connect" />

      <main className="w-full max-w-md flex-1 flex flex-col justify-between px-5 pt-1 pb-24 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <StatusCard title="Line Status" status="Online" variant="success" statusState={callState} />
          <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />

          <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shrink-0">
                {contactInfo ? contactInfo.name[0].toUpperCase() : "?"}
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {contactInfo ? contactInfo.name : "Unknown Contact"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {contactInfo ? `${contactInfo.title || ""} ${contactInfo.location ? `• ${contactInfo.location}` : ""}`.trim() : "Tap to save contact"}
                </p>
              </div>
            </div>

            {contactInfo ? (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            ) : (
              <button
                onClick={() => alert("Save contact trigger")}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                title="Save Contact"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <div className="w-full flex justify-center">
            <DialPad onPress={handleKeyPress} onKeyPress={handleKeyPress} />
          </div>
          <div className="w-full flex justify-center">
            <CallButton onClick={handleCallToggle} isInCall={isInCall} />
          </div>
        </div>
      </main>

      {(!isInCall || isMinimized) && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md">
            <BottomNavigation />
          </div>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(DialerPage), {
  ssr: false,
});