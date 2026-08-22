'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  Plus,
  SlidersHorizontal,
  Download,
  Calendar,
} from 'lucide-react';
import { useSavedViews } from '@/hooks/use-saved-views';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAddCustomer?: () => void;
  onOpenFilters?: () => void;
  onExportCsv?: () => void;
}

export function CommandPalette({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onAddCustomer,
  onOpenFilters,
  onExportCsv,
}: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const { views } = useSavedViews();

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (externalOnOpenChange || (() => {})) : setInternalOpen;

  // Global keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setOpen]);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search workspace..." />
      <CommandList>
        <CommandEmpty>No matching results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?action=add');
              })
            }
          >
            <Plus className="mr-2 h-4 w-4 text-[#16A34A]" />
            <span>Add New Customer</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?action=filter');
              })
            }
          >
            <SlidersHorizontal className="mr-2 h-4 w-4 text-[#2563EB]" />
            <span>Open Advanced Filters</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?action=export');
              })
            }
          >
            <Download className="mr-2 h-4 w-4 text-[#D97706]" />
            <span>Export Customers (Excel / CSV)</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Page Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/');
              })
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-[#4B5563]" />
            <span>Executive Dashboard</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers');
              })
            }
          >
            <Users className="mr-2 h-4 w-4 text-[#4B5563]" />
            <span>Customer Workspace</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Saved Views Navigation */}
        <CommandGroup heading="Saved Views & Risk Filters">
          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?status=active&risk=high');
              })
            }
          >
            <AlertTriangle className="mr-2 h-4 w-4 text-[#EF4444]" />
            <span>Needs Attention (Active &amp; High Risk)</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?status=active');
              })
            }
          >
            <UserCheck className="mr-2 h-4 w-4 text-[#16A34A]" />
            <span>Active Customers</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                const today = new Date().toISOString().split('T')[0];
                const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0];
                router.push(`/customers?lastContactFrom=${lastWeek}&lastContactTo=${today}`);
              })
            }
          >
            <Clock className="mr-2 h-4 w-4 text-[#F59E0B]" />
            <span>Recent Contacts (Past 7 Days)</span>
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleSelect(() => {
                router.push('/customers?status=inactive');
              })
            }
          >
            <UserX className="mr-2 h-4 w-4 text-[#6B7280]" />
            <span>Inactive Customers</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
