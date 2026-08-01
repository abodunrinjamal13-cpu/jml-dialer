"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { StatusCard } from "@/components/dialer/StatusCard";
import { PhoneInput } from "@/components/dialer/PhoneInput";
import { ContactPreview } from "@/components/dialer/ContactPreview";
import { DialPad } from "@/components/dialer/DialPad";
import { CallButton } from "@/components/dialer/CallButton";

export default function DialerPage() {
  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [callState, setCallState] = useState<"Ready" | "Calling" | "Connected" | "End Call">("Ready");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleKeyPress = (val: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber((prev) => prev + val);
    }
  };

  const handleCallToggle = () => {
    if (!isInCall) {
      setIsInCall(true);
      setCallState("Calling");
      setTimeout(() => setCallState("Connected"), 1500);
    } else {
      setCallState("End Call");
      setTimeout(() => {
        setIsInCall(false);
        setCallState("Ready");
      }, 800);
    }
  };

  const knownContact =
    phoneNumber.includes("987654321") || phoneNumber.includes("998765432")
      ? { name: "John Smith", title: "Restaurant Owner", location: "São Paulo" }
      : undefined;

  return (
    <div className="h-screen max-h-[100dvh] bg-slate-100 flex flex-col justify-between items-center overflow-hidden select-none">
      {/* 1. HEADER */}
      <Header />

      {/* 2. MAIN CONTAINER */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-between px-4 py-3 gap-2 overflow-hidden">
        {/* Status Card */}
        <StatusCard statusState={callState} />

        {/* Hero Section: Phone Input & Contact Preview */}
        <div className="flex flex-col gap-2">
          <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
          <ContactPreview
            name={knownContact?.name}
            title={knownContact?.title}
            location={knownContact?.location}
            onSaveContact={() => alert("Save contact trigger")}
          />
        </div>

        {/* Dial Pad */}
        <div className="w-full flex justify-center py-1">
          <DialPad onPress={handleKeyPress} onKeyPress={handleKeyPress} />
        </div>

        {/* Call Button */}
        <div className="w-full flex justify-center pb-12">
          <CallButton onClick={handleCallToggle} isInCall={isInCall} />
        </div>
      </main>

      {/* 3. FLOATING BOTTOM NAVIGATION */}
      <BottomNavigation />
    </div>
  );
}