'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Leaf, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SavedViewsList } from '@/components/customers/saved-views';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      title: 'Customers',
      href: '/customers',
      icon: Users,
      active: pathname.startsWith('/customers'),
    },
    {
      title: 'Companies',
      href: '/companies',
      icon: Building2,
      active: pathname.startsWith('/companies'),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.5)] backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      {/* Sidebar Container (260px fixed width) */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[260px] border-r border-[var(--border-default)] bg-[var(--surface-primary)] transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--border-default)]">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen?.(false)}>
            <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[var(--primary)] text-white shadow-xs group-hover:brightness-110 transition-all">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[var(--text-primary)] tracking-tight text-[16px]">
                Greentiq
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--primary)]">
                CRM Workspace
              </span>
            </div>
          </Link>
          
          <button
            onClick={() => setMobileOpen?.(false)}
            className="p-1.5 rounded-[6px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Environment Badge */}
        <div className="px-6 pt-4">
          <div className="inline-flex items-center gap-1.5 px-[8px] py-[4px] rounded-[4px] bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] text-[11px] font-semibold uppercase tracking-[0.03em]">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--text-quaternary)]" />
            <span>Demo Environment</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-quaternary)]">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen?.(false)}
                className={cn(
                  'flex items-center justify-between px-[16px] py-[10px] rounded-[6px] text-[14px] leading-[1.5] transition-all group relative',
                  item.active
                    ? 'bg-[var(--accent)] text-[var(--primary)] font-semibold border-l-[3px] border-l-[var(--primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] font-normal border-l-[3px] border-l-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      item.active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.active && (
                  <ChevronRight className="w-4 h-4 text-[var(--primary)]" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-6 py-2">
          <hr className="border-[var(--border-default)]" />
        </div>

        {/* Saved Views Section */}
        <div className="flex-1 py-2 overflow-y-auto">
          <React.Suspense fallback={<div className="px-3 py-2 text-[12px] text-[var(--text-quaternary)]">Loading views...</div>}>
            <SavedViewsList />
          </React.Suspense>
        </div>

        {/* Follow-up Risk Engine Sidebar Card */}
        <div className="p-4 m-4 rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border-default)] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Follow-up Risk Engine</p>
          <p className="mt-1 text-[12px] font-medium leading-[1.4] text-[var(--text-tertiary)]">
            Rule-based contact recency tracking
          </p>
        </div>
      </aside>
    </>
  );
}
