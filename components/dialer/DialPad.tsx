"use client";

import React from "react";
import { motion } from "framer-motion";

interface DialPadProps {
  onPress?: (value: string) => void;
  onKeyPress?: (value: string) => void;
}

const keys = [
  { num: "1", sub: "" },
  { num: "2", sub: "ABC" },
  { num: "3", sub: "DEF" },
  { num: "4", sub: "GHI" },
  { num: "5", sub: "JKL" },
  { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" },
  { num: "8", sub: "TUV" },
  { num: "9", sub: "WXYZ" },
  { num: "*", sub: "" },
  { num: "0", sub: "+" },
  { num: "#", sub: "" },
];

export const DialPad: React.FC<DialPadProps> = ({ onPress, onKeyPress }) => {
  const handlePress = (val: string) => {
    if (onPress) {
      onPress(val);
    } else if (onKeyPress) {
      onKeyPress(val);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-y-2 sm:gap-y-3 gap-x-6 justify-items-center my-1 sm:my-2 w-full max-w-[280px] mx-auto">
      {keys.map(({ num, sub }) => (
        <motion.button
          key={num}
          type="button"
          onClick={() => handlePress(num)}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.12 }}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border border-slate-200/80 shadow-xs active:bg-slate-100 flex flex-col items-center justify-center select-none outline-none focus:outline-none focus:bg-white cursor-pointer"
        >
          <span className="text-2xl font-semibold text-slate-800 leading-none">
            {num}
          </span>
          {sub && (
            <span className="text-[10px] font-bold tracking-widest text-slate-400 mt-0.5">
              {sub}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default DialPad;