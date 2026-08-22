'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-[8px] bg-[var(--surface-tertiary)] animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleToggleTheme}
      className={cn(
        'relative h-9 w-9 rounded-[8px] flex items-center justify-center transition-all duration-300',
        'hover:scale-105 active:scale-95',
        isDark
          ? 'bg-[var(--surface-tertiary)] text-amber-400 hover:bg-[var(--surface-elevated)] shadow-[0_0_12px_rgba(251,191,36,0.15)]'
          : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--border-default)] hover:text-[var(--text-primary)]'
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon — shown in dark mode */}
        <Sun
          className={cn(
            'absolute inset-0 w-5 h-5 transition-all duration-300',
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50'
          )}
        />
        {/* Moon icon — shown in light mode */}
        <Moon
          className={cn(
            'absolute inset-0 w-5 h-5 transition-all duration-300',
            isDark
              ? 'opacity-0 -rotate-90 scale-50'
              : 'opacity-100 rotate-0 scale-100'
          )}
        />
      </div>
    </button>
  );
}
