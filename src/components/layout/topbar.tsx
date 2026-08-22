'use client';

import React from 'react';
import { Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette?: () => void;
}

export function Topbar({ onOpenMobileSidebar, onOpenCommandPalette }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-[var(--border-default)] bg-[var(--surface-primary)]/95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-[6px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (opens ⌘K Command Palette) */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center w-64 md:w-80 cursor-pointer group"
        >
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-quaternary)] group-hover:text-[var(--primary)] transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search workspace (⌘K)..."
            className="w-full pl-9 pr-12 py-2 text-[14px] leading-[1.5] rounded-[6px] border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] cursor-pointer hover:border-[var(--primary)] transition-colors focus:outline-none"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[var(--text-tertiary)] bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-[4px] shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Environment / User Badge */}
        <div className="inline-flex items-center gap-1.5 px-[8px] py-[4px] rounded-[4px] bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] text-[11px] font-semibold uppercase tracking-[0.03em]">
          <span className="h-[6px] w-[6px] rounded-full bg-[var(--text-quaternary)]" />
          <span>Demo Environment</span>
        </div>
      </div>
    </header>
  );
}
