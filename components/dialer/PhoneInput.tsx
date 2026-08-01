"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clipboard, Delete, ChevronDown } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
}

// Complete list of world countries with dial codes & flag CDN links
const ALL_COUNTRIES = [
  { code: "+1", countryCode: "US", name: "United States" },
  { code: "+1", countryCode: "CA", name: "Canada" },
  { code: "+7", countryCode: "RU", name: "Russia" },
  { code: "+20", countryCode: "EG", name: "Egypt" },
  { code: "+27", countryCode: "ZA", name: "South Africa" },
  { code: "+30", countryCode: "GR", name: "Greece" },
  { code: "+31", countryCode: "NL", name: "Netherlands" },
  { code: "+32", countryCode: "BE", name: "Belgium" },
  { code: "+33", countryCode: "FR", name: "France" },
  { code: "+34", countryCode: "ES", name: "Spain" },
  { code: "+36", countryCode: "HU", name: "Hungary" },
  { code: "+39", countryCode: "IT", name: "Italy" },
  { code: "+40", countryCode: "RO", name: "Romania" },
  { code: "+41", countryCode: "CH", name: "Switzerland" },
  { code: "+43", countryCode: "AT", name: "Austria" },
  { code: "+44", countryCode: "GB", name: "United Kingdom" },
  { code: "+45", countryCode: "DK", name: "Denmark" },
  { code: "+46", countryCode: "SE", name: "Sweden" },
  { code: "+47", countryCode: "NO", name: "Norway" },
  { code: "+48", countryCode: "PL", name: "Poland" },
  { code: "+49", countryCode: "DE", name: "Germany" },
  { code: "+51", countryCode: "PE", name: "Peru" },
  { code: "+52", countryCode: "MX", name: "Mexico" },
  { code: "+53", countryCode: "CU", name: "Cuba" },
  { code: "+54", countryCode: "AR", name: "Argentina" },
  { code: "+55", countryCode: "BR", name: "Brazil" },
  { code: "+56", countryCode: "CL", name: "Chile" },
  { code: "+57", countryCode: "CO", name: "Colombia" },
  { code: "+58", countryCode: "VE", name: "Venezuela" },
  { code: "+60", countryCode: "MY", name: "Malaysia" },
  { code: "+61", countryCode: "AU", name: "Australia" },
  { code: "+62", countryCode: "ID", name: "Indonesia" },
  { code: "+63", countryCode: "PH", name: "Philippines" },
  { code: "+64", countryCode: "NZ", name: "New Zealand" },
  { code: "+65", countryCode: "SG", name: "Singapore" },
  { code: "+66", countryCode: "TH", name: "Thailand" },
  { code: "+81", countryCode: "JP", name: "Japan" },
  { code: "+82", countryCode: "KR", name: "South Korea" },
  { code: "+84", countryCode: "VN", name: "Vietnam" },
  { code: "+86", countryCode: "CN", name: "China" },
  { code: "+90", countryCode: "TR", name: "Turkey" },
  { code: "+91", countryCode: "IN", name: "India" },
  { code: "+92", countryCode: "PK", name: "Pakistan" },
  { code: "+93", countryCode: "AF", name: "Afghanistan" },
  { code: "+94", countryCode: "LK", name: "Sri Lanka" },
  { code: "+95", countryCode: "MM", name: "Myanmar" },
  { code: "+98", countryCode: "IR", name: "Iran" },
  { code: "+212", countryCode: "MA", name: "Morocco" },
  { code: "+213", countryCode: "DZ", name: "Algeria" },
  { code: "+216", countryCode: "TN", name: "Tunisia" },
  { code: "+218", countryCode: "LY", name: "Libya" },
  { code: "+220", countryCode: "GM", name: "Gambia" },
  { code: "+221", countryCode: "SN", name: "Senegal" },
  { code: "+222", countryCode: "MR", name: "Mauritania" },
  { code: "+223", countryCode: "ML", name: "Mali" },
  { code: "+224", countryCode: "GN", name: "Guinea" },
  { code: "+225", countryCode: "CI", name: "Ivory Coast" },
  { code: "+226", countryCode: "BF", name: "Burkina Faso" },
  { code: "+227", countryCode: "NE", name: "Niger" },
  { code: "+228", countryCode: "TG", name: "Togo" },
  { code: "+229", countryCode: "BJ", name: "Benin" },
  { code: "+230", countryCode: "MU", name: "Mauritius" },
  { code: "+231", countryCode: "LR", name: "Liberia" },
  { code: "+232", countryCode: "SL", name: "Sierra Leone" },
  { code: "+233", countryCode: "GH", name: "Ghana" },
  { code: "+234", countryCode: "NG", name: "Nigeria" },
  { code: "+235", countryCode: "TD", name: "Chad" },
  { code: "+236", countryCode: "CF", name: "Central African Republic" },
  { code: "+237", countryCode: "CM", name: "Cameroon" },
  { code: "+238", countryCode: "CV", name: "Cape Verde" },
  { code: "+239", countryCode: "ST", name: "Sao Tome and Principe" },
  { code: "+240", countryCode: "GQ", name: "Equatorial Guinea" },
  { code: "+241", countryCode: "GA", name: "Gabon" },
  { code: "+242", countryCode: "CG", name: "Congo" },
  { code: "+243", countryCode: "CD", name: "DR Congo" },
  { code: "+244", countryCode: "AO", name: "Angola" },
  { code: "+245", countryCode: "GW", name: "Guinea-Bissau" },
  { code: "+248", countryCode: "SC", name: "Seychelles" },
  { code: "+249", countryCode: "SD", name: "Sudan" },
  { code: "+250", countryCode: "RW", name: "Rwanda" },
  { code: "+251", countryCode: "ET", name: "Ethiopia" },
  { code: "+252", countryCode: "SO", name: "Somalia" },
  { code: "+253", countryCode: "DJ", name: "Djibouti" },
  { code: "+254", countryCode: "KE", name: "Kenya" },
  { code: "+255", countryCode: "TZ", name: "Tanzania" },
  { code: "+256", countryCode: "UG", name: "Uganda" },
  { code: "+257", countryCode: "BI", name: "Burundi" },
  { code: "+258", countryCode: "MZ", name: "Mozambique" },
  { code: "+260", countryCode: "ZM", name: "Zambia" },
  { code: "+261", countryCode: "MG", name: "Madagascar" },
  { code: "+263", countryCode: "ZW", name: "Zimbabwe" },
  { code: "+264", countryCode: "NA", name: "Namibia" },
  { code: "+265", countryCode: "MW", name: "Malawi" },
  { code: "+266", countryCode: "LS", name: "Lesotho" },
  { code: "+267", countryCode: "BW", name: "Botswana" },
  { code: "+268", countryCode: "SZ", name: "Eswatini" },
  { code: "+351", countryCode: "PT", name: "Portugal" },
  { code: "+353", countryCode: "IE", name: "Ireland" },
  { code: "+355", countryCode: "AL", name: "Albania" },
  { code: "+358", countryCode: "FI", name: "Finland" },
  { code: "+380", countryCode: "UA", name: "Ukraine" },
  { code: "+966", countryCode: "SA", name: "Saudi Arabia" },
  { code: "+971", countryCode: "AE", name: "UAE" },
  { code: "+972", countryCode: "IL", name: "Israel" },
  { code: "+974", countryCode: "QA", name: "Qatar" },
].map((c) => ({
  ...c,
  flagUrl: `https://flagcdn.com/w20/${c.countryCode.toLowerCase()}.png`,
}));

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  const [selectedCountry, setSelectedCountry] = useState(
    ALL_COUNTRIES.find((c) => c.countryCode === "NG") || ALL_COUNTRIES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Long press refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  // Auto-detect matching country flag when digits are entered
  useEffect(() => {
    if (!value) return;

    const digitsOnly = value.replace(/\D/g, "");

    // Sort by code length descending so longer dial codes (+256) match before shorter ones (+2)
    const sorted = [...ALL_COUNTRIES].sort((a, b) => b.code.length - a.code.length);

    const match = sorted.find((c) => {
      const cleanCode = c.code.replace(/\D/g, "");
      return digitsOnly.startsWith(cleanCode);
    });

    if (match) {
      setSelectedCountry(match);
    }
  }, [value]);

  const handleDeleteChar = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    onChange("");
  };

  const handlePressStart = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      handleClearAll();
    }, 400); // clears all if held for 400ms
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isLongPressRef.current) {
      handleDeleteChar();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/[^\d+]/g, "");
      onChange(value + cleaned);
    } catch {
      // Fallback
    }
  };

  const filteredCountries = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.includes(searchTerm) ||
      c.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      suppressHydrationWarning
      className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs px-3 py-3 flex flex-col justify-between shrink-0 min-h-[110px]"
    >
      {/* Top Controls Header */}
      <div className="flex items-center justify-between" suppressHydrationWarning>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/50"
          >
            <img
              src={selectedCountry.flagUrl}
              alt={selectedCountry.name}
              className="w-4 h-3 object-cover rounded-xs"
              suppressHydrationWarning
            />
            <span>{selectedCountry.countryCode}</span>
            <span className="text-slate-500 font-normal">{selectedCountry.code}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Search Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 max-h-56 overflow-hidden flex flex-col">
              <input
                type="text"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mx-2 my-1 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
              />
              <div className="overflow-y-auto flex-1">
                {filteredCountries.map((c) => (
                  <button
                    key={`${c.countryCode}-${c.code}`}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsOpen(false);
                      setSearchTerm("");
                      inputRef.current?.focus();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-blue-50 cursor-pointer text-slate-700"
                  >
                    <img src={c.flagUrl} alt={c.name} className="w-4 h-3 object-cover rounded-xs" />
                    <span className="font-semibold text-slate-900">{c.countryCode}</span>
                    <span className="text-slate-500 text-[11px] truncate max-w-[80px]">{c.name}</span>
                    <span className="text-slate-400 ml-auto">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePaste}
            className="px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 text-xs flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="text-xs">Paste</span>
          </button>

          {value && (
            <button
              type="button"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className="p-1 rounded-lg text-slate-400 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
              title="Tap to delete character, hold to delete all"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Display Area */}
      <div className="w-full text-center py-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d+]/g, ""))}
          placeholder="Enter number..."
          className="w-full text-center text-xl font-bold tracking-tight text-slate-900 bg-transparent outline-none caret-blue-600 placeholder:text-slate-300 placeholder:font-normal"
        />
      </div>
    </div>
  );
};

export default PhoneInput;