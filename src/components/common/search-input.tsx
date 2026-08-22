'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  onChange: (debouncedValue: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value: externalValue = '',
  onChange,
  placeholder = 'Search by name, email, or company...',
  className,
  debounceMs = 300,
}: SearchInputProps) {
  // Raw local state for responsive keystrokes
  const [searchTerm, setSearchTerm] = useState(externalValue);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceMs);

  // Use refs to track last emitted value and latest onChange function
  const lastEmittedRef = useRef<string>(externalValue);
  const onChangeRef = useRef(onChange);

  // Keep onChangeRef updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Synchronize internal state if external value changes (e.g. clear filters clicked)
  useEffect(() => {
    setSearchTerm(externalValue);
    lastEmittedRef.current = externalValue;
  }, [externalValue]);

  // Emit debounced value upward ONLY when it actually changes from last emitted value
  useEffect(() => {
    if (debouncedSearchTerm !== lastEmittedRef.current) {
      lastEmittedRef.current = debouncedSearchTerm;
      onChangeRef.current(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 text-sm rounded-lg bg-background border-input transition-colors focus-visible:ring-1"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

