"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";

interface CallButtonProps {
  onClick: () => void;
  isInCall?: boolean;
}

export const CallButton: React.FC<CallButtonProps> = ({
  onClick,
  isInCall = false,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.12 }}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white cursor-pointer select-none outline-none focus:outline-none transition-colors duration-200 ${
        isInCall
          ? "bg-rose-500 shadow-md shadow-rose-500/20"
          : "bg-indigo-600 shadow-[0_0_18px_rgba(79,70,229,0.35)] hover:shadow-[0_0_22px_rgba(79,70,229,0.45)]"
      }`}
    >
      {isInCall ? (
        <PhoneOff className="w-7 h-7" />
      ) : (
        <Phone className="w-7 h-7" />
      )}
    </motion.button>
  );
};

export default CallButton;