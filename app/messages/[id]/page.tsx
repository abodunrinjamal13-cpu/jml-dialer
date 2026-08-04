"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Phone } from "lucide-react";

interface Message {
  id: string;
  user_id: string;
  contact_id: string;
  message: string;
  direction: string; // e.g. "outgoing" or "incoming"
  created_at: string;
}

export default function ChatDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contactName, setContactName] = useState("Loading...");
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function initChat() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setCurrentUserId(userData.user.id);
      }

      if (contactId) {
        const { data: contactData } = await supabase
          .from("contacts")
          .select("name, phone")
          .eq("id", contactId)
          .maybeSingle();

        if (contactData) {
          setContactName(contactData.name);
          setContactPhone(contactData.phone ?? null);
        } else {
          setContactName("Chat Conversation");
        }
      }
    }
    initChat();
  }, [contactId, supabase]);

  // Fetch messages for this specific contact
  useEffect(() => {
    if (!contactId || !currentUserId) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("contact_id", contactId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      } else if (error) {
        console.error("Error fetching messages:", error.message);
      }
    }

    fetchMessages();

    // Realtime subscription for incoming messages
    const channel = supabase
      .channel(`chat_${contactId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, currentUserId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !contactId) return;

    setIsSending(true);
    const text = newMessage;
    setNewMessage("");

    // Resolve phone number dynamically if not already set
    let resolvedPhoneNumber = contactPhone;
    if (contactId && !resolvedPhoneNumber) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("phone")
        .eq("id", contactId)
        .single();
      resolvedPhoneNumber = contact?.phone ?? null;
      setContactPhone(resolvedPhoneNumber);
    }

    // Insert message including phone_number to satisfy database constraints
    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: currentUserId,
        contact_id: contactId,
        phone_number: resolvedPhoneNumber,
        message: text,
        direction: "outgoing",
        status: "sent",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error.message);
      alert("Failed to send: " + error.message);
      // Revert the text input if failed
      setNewMessage(text);
    } else if (data) {
      setMessages((prev) => [...prev, data]);
    }

    setIsSending(false);
  };

  return (
    <div className="relative h-screen w-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
            {contactName[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">{contactName}</h2>
            <p className="text-[10px] text-emerald-500 font-medium">Online</p>
          </div>
        </div>

        <button className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition">
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-20">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 mt-20">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 text-xl">
              💬
            </div>
            <p className="text-xs">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.direction === "outgoing" || msg.user_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}