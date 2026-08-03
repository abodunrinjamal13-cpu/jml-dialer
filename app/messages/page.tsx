"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  key: string;
  contactId: string | null;
  phoneNumber: string | null;
  name: string;
  avatarText: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

function formatTimestamp(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, name")
        .eq("user_id", userId);

      const { data: messages } = await supabase
        .from("messages")
        .select("id, contact_id, phone_number, message, direction, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!messages) {
        setLoading(false);
        return;
      }

      const contactMap = new Map((contacts ?? []).map((c) => [c.id, c.name]));
      const grouped = new Map<string, Conversation>();

      for (const msg of messages) {
        const key = msg.contact_id ?? msg.phone_number ?? msg.id;
        if (grouped.has(key)) continue;

        const name = msg.contact_id
          ? contactMap.get(msg.contact_id) ?? "Unknown"
          : msg.phone_number ?? "Unknown number";

        grouped.set(key, {
          key,
          contactId: msg.contact_id,
          phoneNumber: msg.phone_number,
          name,
          avatarText: name.charAt(0).toUpperCase(),
          lastMessage: msg.message,
          timestamp: formatTimestamp(msg.created_at),
          unreadCount: 0,
        });
      }

      for (const msg of messages) {
        const key = msg.contact_id ?? msg.phone_number ?? msg.id;
        if (msg.direction === "inbound" && msg.status !== "read" && grouped.has(key)) {
          grouped.get(key)!.unreadCount += 1;
        }
      }

      setConversations(Array.from(grouped.values()));
      setLoading(false);
    }

    loadConversations();
  }, [supabase]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openConversation = (conv: Conversation) => {
    const target = conv.contactId ?? `number-${encodeURIComponent(conv.phoneNumber ?? "")}`;
    router.push(`/messages/${target}`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading messages...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No messages found</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.key}
                onClick={() => openConversation(conv)}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                    {conv.avatarText}
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{conv.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                      {conv.lastMessage}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium">{conv.timestamp}</span>
                  {conv.unreadCount > 0 ? (
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