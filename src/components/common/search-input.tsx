'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
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

  const isDebouncing = searchTerm !== debouncedSearchTerm;

  // Use refs to track last emitted value and latest onChange function
  const lastEmittedRef = useRef<string>(externalValue);
  const onChangeRef = useRef(onChange);

  // Keep onChangeRef updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Synchronize internal state if external value changes during render (e.g. clear filters clicked or URL state changed)
  const [prevExternalValue, setPrevExternalValue] = useState(externalValue);
  if (externalValue !== prevExternalValue) {
    setPrevExternalValue(externalValue);
    setSearchTerm(externalValue);
  }

  useEffect(() => {
    lastEmittedRef.current = externalValue;
  }, [externalValue]);

  // Emit debounced value upward ONLY when it actually changes from last emitted value
  useEffect(() => {
    if (debouncedSearchTerm !== lastEmittedRef.current) {
      lastEmittedRef.current = debouncedSearchTerm;
      onChangeRef.current(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  // Instant clear handler
  const handleClear = () => {
    setSearchTerm('');
    if (lastEmittedRef.current !== '') {
      lastEmittedRef.current = '';
      onChangeRef.current('');
    }
  };

  // Keyboard accessibility: ESC key clears search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-quaternary)] pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search customers"
        className="pl-9 pr-9 h-[36px] text-[14px] leading-[1.5] rounded-[6px] border border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus-visible:ring-1 focus-visible:ring-[var(--text-quaternary)] focus-visible:border-[var(--text-quaternary)] focus:border-[var(--text-quaternary)] focus:ring-0 focus-visible:outline-none"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isDebouncing && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
        )}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
