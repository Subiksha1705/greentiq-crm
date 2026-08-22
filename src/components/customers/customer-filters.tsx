'use client';

import React, { useState, useEffect } from 'react';
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
  const [draft, setDraft] = useState<CustomerFilterState>(committedFilters);

  // Sync draft state whenever drawer opens or committedFilters change
  useEffect(() => {
    if (isOpen) {
      setDraft(committedFilters);
    }
  }, [isOpen, committedFilters]);

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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full bg-card text-foreground">
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#16A34A]" />
            <SheetTitle className="text-[18px] font-semibold leading-[1.3] text-[#1A1D23]">
              Filter Customers
            </SheetTitle>
          </div>
          <SheetDescription className="text-[12px] font-medium leading-[1.4] text-[#6B7280]">
            Refine customer directory by status, risk levels, company, or date ranges.
          </SheetDescription>
        </SheetHeader>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#6B7280]">
              Customer Status
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-[14px] font-normal text-[#1A1D23]">
                <Checkbox
                  checked={draft.status?.includes('active') ?? false}
                  onCheckedChange={() => handleStatusToggle('active')}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[14px] font-normal text-[#1A1D23]">
                <Checkbox
                  checked={draft.status?.includes('inactive') ?? false}
                  onCheckedChange={() => handleStatusToggle('inactive')}
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

          {/* Follow-up Risk Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#6B7280]">
              Follow-up Risk Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low' as RiskLevel, label: 'Low Risk', bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
                { key: 'medium' as RiskLevel, label: 'Medium Risk', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
                { key: 'high' as RiskLevel, label: 'High Risk', bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
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
                        ? 'border-[#16A34A] ring-2 ring-[#DCFCE7] shadow-xs'
                        : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
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

          <hr className="border-[#E5E7EB]" />

          {/* Company Multi-select Section */}
          {companyOptions.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#6B7280]">
                Company
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 p-3 border border-[#E5E7EB] rounded-[6px] bg-[#F9FAFB]">
                {companyOptions.map((comp) => {
                  const isChecked = draft.company?.includes(comp) ?? false;
                  return (
                    <label
                      key={comp}
                      className="flex items-center gap-2.5 cursor-pointer text-[14px] p-1 rounded hover:bg-[#F3F4F6] transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCompanyToggle(comp)}
                      />
                      <span className="text-[14px] font-normal text-[#1A1D23] truncate">{comp}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <hr className="border-[#E5E7EB]" />

          {/* Last Contact Date Range Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#6B7280] flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Last Contact Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[#6B7280]">From (Inclusive)</span>
                <Input
                  type="date"
                  value={draft.lastContactFrom || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactFrom: e.target.value || undefined,
                    }))
                  }
                  className="h-9 text-[14px] border-[#D1D5DB] rounded-[6px] focus-visible:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[#6B7280]">To (Inclusive)</span>
                <Input
                  type="date"
                  value={draft.lastContactTo || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactTo: e.target.value || undefined,
                    }))
                  }
                  className="h-9 text-[14px] border-[#D1D5DB] rounded-[6px] focus-visible:ring-[#16A34A]"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

          {/* Email / Phone Substring Section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#4B5563]">
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
                className="h-9 text-[14px] border-[#D1D5DB] rounded-[6px] focus-visible:ring-[#16A34A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#4B5563]">
                Phone Filter (Partial Match)
              </label>
              <Input
                type="text"
                placeholder="e.g. 555-0199"
                value={draft.phone || ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    phone: e.target.value || undefined,
                  }))
                }
                className="h-9 text-[14px] border-[#D1D5DB] rounded-[6px] focus-visible:ring-[#16A34A]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-[12px] font-medium text-[#4B5563] hover:text-[#991B1B] hover:bg-[#FEE2E2] gap-1.5 rounded-[6px]"
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
              className="text-[14px] font-medium border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] rounded-[6px] px-3.5 py-2"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-[14px] font-semibold bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white rounded-[6px] px-4 py-2 shadow-xs"
            >
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
