'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomerFilterState, CustomerStatus, RiskLevel } from '@/types/customer';
import { SlidersHorizontal, RotateCcw, Check, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { PhoneInput } from '@/components/ui/phone-input';
import { format } from 'date-fns';

interface CustomerFiltersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  committedFilters: CustomerFilterState;
  onApplyFilters: (filters: CustomerFilterState) => void;
  onClearAll: () => void;
  companyOptions?: string[];
}

export function CustomerFilters({
  isOpen,
  onOpenChange,
  committedFilters,
  onApplyFilters,
  onClearAll,
  companyOptions = [],
}: CustomerFiltersProps) {
  // Local DRAFT filter state initialized from committed filters when drawer opens
  const [prevCommittedFilters, setPrevCommittedFilters] = useState<CustomerFilterState>(committedFilters);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [draft, setDraft] = useState<CustomerFilterState>(committedFilters);

  // Sync draft state during render whenever drawer opens or committedFilters change
  if (isOpen !== prevIsOpen || committedFilters !== prevCommittedFilters) {
    setPrevIsOpen(isOpen);
    setPrevCommittedFilters(committedFilters);
    if (isOpen) {
      setDraft(committedFilters);
    }
  }

  // Status toggle handler
  const handleStatusToggle = (status: CustomerStatus) => {
    const current = draft.status || [];
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setDraft((prev) => ({ ...prev, status: next.length > 0 ? next : undefined }));
  };

  // Risk toggle handler
  const handleRiskToggle = (risk: RiskLevel) => {
    const current = draft.risk || [];
    const next = current.includes(risk)
      ? current.filter((r) => r !== risk)
      : [...current, risk];
    setDraft((prev) => ({ ...prev, risk: next.length > 0 ? next : undefined }));
  };

  // Company toggle handler
  const handleCompanyToggle = (company: string) => {
    const current = draft.company || [];
    const next = current.includes(company)
      ? current.filter((c) => c !== company)
      : [...current, company];
    setDraft((prev) => ({ ...prev, company: next.length > 0 ? next : undefined }));
  };

  // Apply draft -> committed
  const handleApply = () => {
    onApplyFilters(draft);
    onOpenChange(false);
  };

  // Clear All
  const handleClearAll = () => {
    setDraft({});
    onClearAll();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full bg-[var(--card)] text-[var(--foreground)]">
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[var(--primary)]" />
            <SheetTitle className="text-[18px] font-semibold leading-[1.3] text-[var(--text-primary)]">
              Filter Customers
            </SheetTitle>
          </div>
          <SheetDescription className="text-[12px] font-medium leading-[1.4] text-[var(--text-tertiary)]">
            Refine customer directory by status, risk levels, company, or date ranges.
          </SheetDescription>
        </SheetHeader>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
              Customer Status
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-[14px] font-normal text-[var(--text-primary)]">
                <Checkbox
                  checked={draft.status?.includes('active') ?? false}
                  onCheckedChange={() => handleStatusToggle('active')}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[14px] font-normal text-[var(--text-primary)]">
                <Checkbox
                  checked={draft.status?.includes('inactive') ?? false}
                  onCheckedChange={() => handleStatusToggle('inactive')}
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <hr className="border-[var(--border-default)]" />

          {/* Follow-up Risk Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
              Follow-up Risk Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low' as RiskLevel, label: 'Low Risk', bg: 'var(--risk-low-bg)', text: 'var(--risk-low-text)', dot: 'var(--risk-low-dot)' },
                { key: 'medium' as RiskLevel, label: 'Medium Risk', bg: 'var(--risk-medium-bg)', text: 'var(--risk-medium-text)', dot: 'var(--risk-medium-dot)' },
                { key: 'high' as RiskLevel, label: 'High Risk', bg: 'var(--risk-high-bg)', text: 'var(--risk-high-text)', dot: 'var(--risk-high-dot)' },
              ].map(({ key, label, bg, text, dot }) => {
                const isChecked = draft.risk?.includes(key) ?? false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRiskToggle(key)}
                    className={cn(
                      'flex items-center justify-between px-[10px] py-[8px] rounded-[4px] border text-[12px] font-semibold transition-all text-left',
                      isChecked
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs'
                        : 'border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                    )}
                    style={{ backgroundColor: bg, color: text }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ backgroundColor: dot }} />
                      <span>{label}</span>
                    </div>
                    {isChecked && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: text }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-[var(--border-default)]" />

          {/* Company Multi-select Section */}
          {companyOptions.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
                Company
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 p-3 border border-[var(--border-default)] rounded-[6px] bg-[var(--surface-secondary)]">
                {companyOptions.map((comp) => {
                  const isChecked = draft.company?.includes(comp) ?? false;
                  return (
                    <label
                      key={comp}
                      className="flex items-center gap-2.5 cursor-pointer text-[14px] p-1 rounded hover:bg-[var(--surface-tertiary)] transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCompanyToggle(comp)}
                      />
                      <span className="text-[14px] font-normal text-[var(--text-primary)] truncate">{comp}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <hr className="border-[var(--border-default)]" />

          {/* Last Contact Date Range Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)] flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Last Contact Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[var(--text-tertiary)]">From (Inclusive)</span>
                <DatePicker
                  date={draft.lastContactFrom ? new Date(`${draft.lastContactFrom}T00:00:00`) : undefined}
                  onSelect={(date) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactFrom: date ? format(date, 'yyyy-MM-dd') : undefined,
                    }))
                  }
                  placeholder="Select Date"
                  className="h-9 text-[14px] rounded-[6px] focus-visible:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[var(--text-tertiary)]">To (Inclusive)</span>
                <DatePicker
                  date={draft.lastContactTo ? new Date(`${draft.lastContactTo}T00:00:00`) : undefined}
                  onSelect={(date) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactTo: date ? format(date, 'yyyy-MM-dd') : undefined,
                    }))
                  }
                  placeholder="Select Date"
                  className="h-9 text-[14px] rounded-[6px] focus-visible:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-default)]" />

          {/* Email / Phone Substring Section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Email Filter (Partial Match)
              </label>
              <Input
                type="text"
                placeholder="e.g. @acme.com"
                value={draft.email || ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    email: e.target.value || undefined,
                  }))
                }
                className="h-9 text-[14px] border-[var(--border-default)] rounded-[6px] focus-visible:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Phone Filter (Partial Match)
              </label>
              <PhoneInput
                value={draft.phone || ''}
                onChange={(val) =>
                  setDraft((prev) => ({
                    ...prev,
                    phone: val || undefined,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-6 border-t border-[var(--border-default)] bg-[var(--surface-secondary)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--risk-high-text)] hover:bg-[var(--accent-red-bg)] gap-1.5 rounded-[6px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-[14px] font-medium border-[var(--border-default)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-[6px] px-3.5 py-2"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-[14px] font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white rounded-[6px] px-4 py-2 shadow-xs"
            >
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
