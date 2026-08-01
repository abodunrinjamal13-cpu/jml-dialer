import React from "react";

interface StatusCardProps {
  title: string;
  status: string;
  variant?: "success" | "danger" | "primary";
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, status, variant = "primary" }) => {
  const badgeStyles = {
    primary: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
      <span className="text-sm font-medium text-slate-600">{title}</span>
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeStyles[variant]}`}>
        {status}
      </span>
    </div>
  );
};