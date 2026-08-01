import React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  return (
    <Input
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter phone number..."
      className="text-center text-2xl tracking-wider font-mono h-14 bg-transparent border-none focus-visible:ring-0"
    />
  );
};