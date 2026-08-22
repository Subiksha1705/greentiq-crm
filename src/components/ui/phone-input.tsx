'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', placeholder: '71 123 4567' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function PhoneInput({
  value = '',
  onChange,
  disabled = false,
  className,
}: PhoneInputProps) {
  // Parse incoming value to separate dialCode and localNumber
  const parseInitial = (val: string) => {
    if (!val) return { country: COUNTRY_CODES[0], localNumber: '' };
    const matchedCountry = COUNTRY_CODES.find((c) => val.startsWith(c.dialCode));
    if (matchedCountry) {
      const localNumber = val.slice(matchedCountry.dialCode.length).trim();
      return { country: matchedCountry, localNumber };
    }
    return { country: COUNTRY_CODES[0], localNumber: val };
  };

  // Derived directly from props — no effect needed for the common case
  const { country: derivedCountry, localNumber: derivedLocalNumber } = parseInitial(value);

  // Local override state only for in-progress typing/country selection
  const [override, setOverride] = useState<{ country: CountryCode; localNumber: string } | null>(null);

  const selectedCountry = override?.country ?? derivedCountry;
  const localNumber = override?.localNumber ?? derivedLocalNumber;

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
    setOverride({ country, localNumber });
    const combined = localNumber.trim() ? `${country.dialCode} ${localNumber.trim()}` : '';
    onChange?.(combined);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setOverride({ country: selectedCountry, localNumber: raw });
    const combined = raw.trim() ? `${selectedCountry.dialCode} ${raw.trim()}` : '';
    onChange?.(combined);
  };

  // Reset the local override during render when value genuinely changes externally
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setOverride(null);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Country Code Dropdown */}
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px] h-9 shrink-0 text-[13px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)] px-2.5">
          <SelectValue>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="font-mono text-[12px]">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={c.code} value={c.code} className="text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{c.flag}</span>
                <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
                <span className="text-[var(--text-tertiary)] font-mono text-[12px] ml-auto">{c.dialCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Local Phone Number Input */}
      <Input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={selectedCountry.placeholder}
        disabled={disabled}
        className="h-9 text-[14px] border-[var(--border-default)] flex-1 font-mono focus-visible:ring-[var(--primary)]"
      />
    </div>
  );
}
