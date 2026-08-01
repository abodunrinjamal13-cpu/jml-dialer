import React from "react";

interface DialButtonProps {
  number: string;
  letters?: string;
  onClick: (val: string) => void;
}

export const DialButton: React.FC<DialButtonProps> = ({ number, letters, onClick }) => {
  return (
    <button
      onClick={() => onClick(number)}
      className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex flex-col items-center justify-center transition-all shadow-sm"
    >
      <span className="text-xl font-semibold text-slate-800">{number}</span>
      {letters && <span className="text-[10px] text-slate-400 font-medium tracking-widest">{letters}</span>}
    </button>
  );
};