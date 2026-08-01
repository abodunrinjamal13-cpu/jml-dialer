"use client";

import React from "react";
import { HistoryItem, HistoryItemType } from "./HistoryItem";

interface HistoryGroupProps {
  title: string;
  items: HistoryItemType[];
  onCallAgain?: (num: string) => void;
  onDelete?: (id: string) => void;
}

export const HistoryGroup: React.FC<HistoryGroupProps> = ({
  title,
  items,
  onCallAgain,
  onDelete,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
        {title}
      </h3>
      <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
        {items.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            onCallAgain={onCallAgain}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryGroup;