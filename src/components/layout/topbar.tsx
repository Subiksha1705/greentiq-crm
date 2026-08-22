'use client';

import React from 'react';
import { Menu, Search } from 'lucide-react';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette?: () => void;
}

export function Topbar({ onOpenMobileSidebar, onOpenCommandPalette }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-[6px] text-[#6B7280] hover:text-[#1A1D23] hover:bg-[#F3F4F6] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (opens ⌘K Command Palette) */}
        <div
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center w-64 md:w-80 cursor-pointer group"
        >
          <Search className="absolute left-3 w-4 h-4 text-[#9CA3AF] group-hover:text-[#16A34A] transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search workspace (⌘K)..."
            className="w-full pl-9 pr-12 py-2 text-[14px] leading-[1.5] rounded-[6px] border border-[#D1D5DB] bg-[#F9FAFB] text-[#1A1D23] placeholder:text-[#9CA3AF] cursor-pointer hover:border-[#16A34A] transition-colors focus:outline-none"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#6B7280] bg-white border border-[#D1D5DB] rounded-[4px] shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment / User Badge */}
        <div className="inline-flex items-center gap-1.5 px-[8px] py-[4px] rounded-[4px] bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold uppercase tracking-[0.03em]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#94A3B8]" />
          <span>Demo Environment</span>
        </div>
      </div>
    </header>
  );
}
