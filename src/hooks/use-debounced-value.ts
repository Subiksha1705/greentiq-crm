'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value.
 * @param value The value to debounce.
 * @param delay Delay in milliseconds (default: 300ms).
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
