import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`backdrop-blur-md bg-white/70 border border-white/20 shadow-lg rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};