"use client";

import React, { useState } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Copy,
  Trash2,
  UserPlus,
  MessageSquare,
} from "lucide-react";
export type CallType = "incoming" | "outgoing" | "missed";
export type CallStatus = "answered" | "missed" | "rejected";

export interface HistoryItemType {
  id: string;
  name: string;
  number: string;
  type: CallType;
  status: CallStatus;
  duration?: number;
  timestamp: string;
}

interface HistoryItemProps {
  item: HistoryItemType;
  onCallAgain?: (number: string) => void;
  onDelete?: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onCallAgain,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Helper to format duration in seconds -> "3m 12s" or "15s"
  const formatDuration = (secs?: number) => {
    if (!secs) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Render icons & color status
  const renderCallIcon = () => {
    switch (item.type) {
      case "incoming":
        return <PhoneIncoming className="w-4 h-4 text-emerald-500" />;
      case "outgoing":
        return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
      case "missed":
        return <PhoneMissed className="w-4 h-4 text-rose-500" />;
    }
  };

  const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative bg-white border-b border-slate-100 last:border-none py-3 px-1">
      <div
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center justify-between cursor-pointer hover:bg-slate-50/60 rounded-lg p-1 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Call Type Icon Indicator */}
          <div className="p-2 rounded-full bg-slate-100/80 shrink-0">
            {renderCallIcon()}
          </div>

          {/* Contact Details */}
          <div className="flex flex-col">
            <span
              className={`text-sm font-semibold ${
                item.type === "missed" ? "text-rose-600" : "text-slate-900"
              }`}
            >
              {item.name || item.number}
            </span>
            <span className="text-xs text-slate-400 font-medium capitalize">
              {item.type}
            </span>
          </div>
        </div>

        {/* Timestamp & Duration */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 font-medium">
            {formattedTime}
          </span>
          {item.duration && (
            <span className="text-[11px] text-slate-400 font-normal">
              {formatDuration(item.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Tap Options Drawer / Action Menu */}
      {showOptions && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-around bg-slate-50 rounded-xl p-2 text-xs text-slate-700">
          <button
            type="button"
            onClick={() => onCallAgain?.(item.number)}
            className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Call Again</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span>Message</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-600" />
            <span>Add Contact</span>
          </button>

          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(item.number)}
            className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            <span>Copy</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(item.id)}
            className="flex flex-col items-center gap-1 hover:text-rose-600 transition-colors text-rose-500 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;