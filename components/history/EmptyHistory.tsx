"use client";

import React from "react";
import { History } from "lucide-react";

export function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-100 my-4">
      <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-400">
        <History className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">No Call History</h3>
      <p className="text-xs text-slate-400 mt-1">
        Your recent incoming and outgoing call logs will appear here.
      </p>
    </div>
  );
}

export default EmptyHistory;