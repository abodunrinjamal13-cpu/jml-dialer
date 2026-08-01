"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  avatarText: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Omowunmi",
    avatarText: "O",
    lastMessage: "Are you coming over later?",
    timestamp: "10:42 AM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "RAW GYM Front Desk",
    avatarText: "R",
    lastMessage: "Your monthly membership renewal was successful.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    name: "Alexander Wright",
    avatarText: "A",
    lastMessage: "Sent you the project update documents.",
    timestamp: "Jul 29",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "Blessing Adebayo",
    avatarText: "B",
    lastMessage: "Thanks! Will check it out now.",
    timestamp: "Jul 25",
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 pb-28 sm:px-6">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Conversation List */}
        <div className="flex flex-col gap-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No messages found</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {conv.avatarText}
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{conv.name}</span>
                    <span className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                      {conv.lastMessage}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium">{conv.timestamp}</span>
                  {conv.unreadCount && conv.unreadCount > 0 ? (
                    <span className="bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}