"use client";

import React, { useState } from "react";
import HistoryGroup from "@/components/history/HistoryGroup";
import { EmptyHistory } from "@/components/history/EmptyHistory";
import SearchBar from "@/components/history/SearchBar";
import { HistoryItemType } from "@/types/history";

// Static dummy data to prevent hydration time mismatches
const initialHistory: HistoryItemType[] = [
  {
    id: "1",
    name: "Omowunmi",
    number: "+2348012345678",
    type: "incoming",
    status: "answered",
    duration: 192,
    timestamp: "2026-07-31T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Unknown Contact",
    number: "+2349098765432",
    type: "missed",
    status: "missed",
    timestamp: "2026-07-31T09:30:00.000Z",
  },
  {
    id: "3",
    name: "RAW GYM Front Desk",
    number: "+2347011223344",
    type: "outgoing",
    status: "answered",
    duration: 45,
    timestamp: "2026-07-30T14:15:00.000Z",
  },
];

type FilterType = "all" | "missed" | "incoming" | "outgoing";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItemType[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleCallAgain = (num: string) => {
    alert(`Calling ${num}...`);
  };

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
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

    calls.forEach((call) => {
      const callDate = new Date(call.timestamp);
      const today = new Date("2026-07-31");
      const yesterday = new Date("2026-07-30");

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
        {/* Header */}
        <h1 className="text-xl font-bold text-slate-900 px-1">Call History</h1>

        {/* Search Input */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Filter Pills with Brand Blue */}
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

        {/* Call Logs grouped by date */}
        {filteredHistory.length === 0 ? (
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