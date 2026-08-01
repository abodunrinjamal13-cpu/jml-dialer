import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  variant?: "call" | "hangup" | "default";
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, variant = "default" }) => {
  const bgColors = {
    call: "bg-green-500 hover:bg-green-600 text-white",
    hangup: "bg-red-500 hover:bg-red-600 text-white",
    default: "bg-slate-200 hover:bg-slate-300 text-slate-700",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-full transition-all active:scale-95 ${bgColors[variant]}`}
    >
      <div className="text-xl">{icon}</div>
      {label && <span className="text-xs mt-1 font-medium">{label}</span>}
    </button>
  );
};