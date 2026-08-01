"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StatusCardProps {
  title?: string;
  status?: string;
  variant?: "success" | "warning" | "error";
  statusState?: "Ready" | "Calling" | "Connected" | "End Call";
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title = "Line Status",
  statusState = "Ready",
}) => {
  return (
    <div className="w-full bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              statusState === "Connected"
                ? "bg-emerald-400"
                : statusState === "Calling"
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              statusState === "Connected"
                ? "bg-emerald-500"
                : statusState === "Calling"
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
          />
        </span>
        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>

      {/* Smoothly animated status label */}
      <div className="text-xs font-semibold text-slate-500 min-w-[70px] text-right">
        <AnimatePresence mode="wait">
          <motion.span
            key={statusState}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="inline-block"
          >
            {statusState}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatusCard;