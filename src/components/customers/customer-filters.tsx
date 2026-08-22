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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0">
        {/* Drawer Header */}
        <SheetHeader className="p-6 border-b text-left">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <SheetTitle className="text-xl font-bold">Filter Customers</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Refine customer directory by status, risk levels, company, or date ranges.
          </SheetDescription>
        </SheetHeader>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <Checkbox
                  checked={draft.status?.includes('active') ?? false}
                  onCheckedChange={() => handleStatusToggle('active')}
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <Checkbox
                  checked={draft.status?.includes('inactive') ?? false}
                  onCheckedChange={() => handleStatusToggle('inactive')}
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Follow-up Risk Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Follow-up Risk Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low' as RiskLevel, label: 'Low Risk', color: 'border-emerald-500/30 text-emerald-600' },
                { key: 'medium' as RiskLevel, label: 'Medium Risk', color: 'border-amber-500/30 text-amber-600' },
                { key: 'high' as RiskLevel, label: 'High Risk', color: 'border-rose-500/30 text-rose-600 font-semibold' },
              ].map(({ key, label }) => {
                const isChecked = draft.risk?.includes(key) ?? false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRiskToggle(key)}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all text-left',
                      isChecked
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-border bg-card hover:bg-muted/50 text-foreground'
                    )}
                  >
                    <span>{label}</span>
                    {isChecked && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Company Multi-select Section */}
          {companyOptions.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2.5 bg-muted/20">
                {companyOptions.map((comp) => {
                  const isChecked = draft.company?.includes(comp) ?? false;
                  return (
                    <label
                      key={comp}
                      className="flex items-center gap-2.5 cursor-pointer text-sm p-1 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleCompanyToggle(comp)}
                      />
                      <span className="text-xs font-medium text-foreground truncate">{comp}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <hr className="border-border/50" />

          {/* Last Contact Date Range Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Last Contact Date Range</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">From (Inclusive)</span>
                <Input
                  type="date"
                  value={draft.lastContactFrom || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactFrom: e.target.value || undefined,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">To (Inclusive)</span>
                <Input
                  type="date"
                  value={draft.lastContactTo || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      lastContactTo: e.target.value || undefined,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Email / Phone Substring Section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
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
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
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
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-6 border-t bg-muted/30 gap-2 flex-row sm:justify-between items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
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
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs font-semibold px-4"
            >
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
