"use client";

import React from "react";
import { UserPlus, UserCheck, MapPin, Briefcase } from "lucide-react";

interface ContactPreviewProps {
  name?: string;
  title?: string;
  location?: string;
  rating?: number;
  onSaveContact?: () => void;
}

export const ContactPreview: React.FC<ContactPreviewProps> = ({
  name,
  title,
  location,
  onSaveContact,
}) => {
  const isKnown = Boolean(name);

  return (
    <div className="w-full bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
            isKnown ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-500"
          }`}
        >
          {isKnown ? name?.charAt(0) : "?"}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">
            {isKnown ? name : "Unknown Contact"}
          </h4>
          {isKnown ? (
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
              {title && (
                <span className="flex items-center gap-0.5">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  {title}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  {location}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 mt-0.5">Tap to save contact</p>
          )}
        </div>
      </div>

      {!isKnown ? (
        <button
          type="button"
          onClick={onSaveContact}
          className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-xs cursor-pointer"
          title="Save Contact"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      ) : (
        <div className="p-1.5 text-blue-600">
          <UserCheck className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ContactPreview;