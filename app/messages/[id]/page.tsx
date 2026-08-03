"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  message: string;
  direction: string | null;
  created_at: string;
}

export default function ConversationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const rawId = params.id as string;

  const isUnknownNumber = rawId.startsWith("number-");
  const phoneNumber = isUnknownNumber ? decodeURIComponent(rawId.replace("number-", "")) : null;
  const contactId = isUnknownNumber ? null : rawId;

  const [displayName, setDisplayName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversation() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      let query = supabase
        .from("messages")
        .select("id, message, direction, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (contactId) {
        const { data: contact } = await supabase
          .from("contacts")
          .select("name")
          .eq("id", contactId)
          .single();
        setDisplayName(contact?.name ?? "Unknown");
        query = query.eq("contact_id", contactId);
      } else {
        setDisplayName(phoneNumber ?? "Unknown number");
        query = query.eq("phone_number", phoneNumber).is("contact_id", null);
      }

      const { data: msgs } = await query;
      setMessages(msgs ?? []);
      setLoading(false);

      const markReadQuery = supabase
        .from("messages")
        .update({ status: "read" })
        .eq("user_id", userId)
        .eq("direction", "inbound");

      if (contactId) {
        await markReadQuery.eq("contact_id", contactId);
      } else {
        await markReadQuery.eq("phone_number", phoneNumber).is("contact_id", null);
      }
    }

    loadConversation();
  }, [contactId, phoneNumber, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSending(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        contact_id: contactId,
        phone_number: phoneNumber,
        message: newMessage,
        direction: "outbound",
        status: "sent",
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/messages")}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 pb-24">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs ${
                msg.direction === "outbound"
                  ? "self-end bg-blue-600 text-white rounded-br-sm"
                  : "self-start bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
              }`}
            >
              {msg.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-white shrink-0 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}