"use client";

import React, { useEffect, useState } from "react";
import HistoryGroup from "@/components/history/HistoryGroup";
import { EmptyHistory } from "@/components/history/EmptyHistory";
import SearchBar from "@/components/history/SearchBar";
import { HistoryItemType } from "@/types/history";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FilterType = "all" | "missed" | "incoming" | "outgoing";

function mapCallType(direction: string | null, status: string | null): "incoming" | "missed" | "outgoing" {
  if (status === "missed" || status === "no-answer" || status === "failed") return "missed";
  if (direction === "inbound") return "incoming";
  return "outgoing";
}

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const loadHistory = async () => {
    setLoading(true);
    setLoadError("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("call_history")
      .select("id, phone_number, direction, status, duration, started_at, contacts(name)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    const mapped: HistoryItemType[] = (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.contacts?.name ?? "Unknown Contact",
      number: row.phone_number ?? "",
      type: mapCallType(row.direction, row.status),
      status: row.status === "missed" ? "missed" : "answered",
      duration: row.duration ?? undefined,
      timestamp: row.started_at ?? new Date().toISOString(),
    }));

    setHistory(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallAgain = (num: string) => {
    router.push(`/dialer?number=${encodeURIComponent(num)}`);
  };

  const handleDelete = async (id: string) => {
    const previous = history;
    setHistory((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase.from("call_history").delete().eq("id", id);
    if (error) {
      setHistory(previous);
      alert("Failed to delete call: " + error.message);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.includes(searchQuery);

    const matchesFilter =
      activeFilter === "all" ? true : item.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const groupCallsByDate = (calls: HistoryItemType[]) => {
    const groups: { [key: string]: HistoryItemType[] } = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    calls.forEach((call) => {
      const callDate = new Date(call.timestamp);

      let key = "Older";
      if (callDate.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (callDate.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(call);
    });

    return groups;
  };

  const groupedHistory = groupCallsByDate(filteredHistory);

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 pb-28 sm:px-6">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
        <h1 className="text-xl font-bold text-slate-900 px-1">Call History</h1>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(["all", "missed", "incoming", "outgoing"] as FilterType[]).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading call history...</div>
        ) : loadError ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <span className="text-xs text-rose-600">Failed to load call history: {loadError}</span>
            <button
              onClick={loadHistory}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyHistory />
        ) : (
          Object.entries(groupedHistory).map(
            ([dateLabel, items]) =>
              items.length > 0 && (
                <HistoryGroup
                  key={dateLabel}
                  title={dateLabel}
                  items={items}
                  onCallAgain={handleCallAgain}
                  onDelete={handleDelete}
                />
              )
          )
        )}
      </div>
    </div>
  );
}