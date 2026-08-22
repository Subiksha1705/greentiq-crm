'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CompanyWithStats } from '@/types/company';
import { exportCompanies } from '@/lib/export-import';
import { FileSpreadsheet, FileText, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CompanyExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companies: CompanyWithStats[];
}

export function CompanyExportModal({
  isOpen,
  onOpenChange,
  companies,
}: CompanyExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const handleExport = () => {
    if (companies.length === 0) {
      toast.error('No companies to export.');
      return;
    }

    exportCompanies(companies, selectedFormat, 'greentiq_companies');
    toast.success(`Exported ${companies.length} company account(s) to ${selectedFormat.toUpperCase()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[var(--accent)] border border-[var(--accent-green-border)] flex items-center justify-center text-[var(--primary)]">
              <Download className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-[var(--text-primary)]">
              Export Companies
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px] text-[var(--text-tertiary)] pt-1">
            Choose your preferred file format to export all matching company records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Format Selection Cards */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Select File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Excel Option */}
              <div
                onClick={() => setSelectedFormat('xlsx')}
                className={cn(
                  'p-3.5 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between relative',
                  selectedFormat === 'xlsx'
                    ? 'border-[var(--primary)] bg-[var(--accent)] ring-2 ring-[var(--primary)]/20'
                    : 'border-[var(--border-default)] bg-[var(--card)] hover:border-[var(--text-tertiary)]'
                )}
              >
                {selectedFormat === 'xlsx' && (
                  <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-5 w-5 text-[var(--primary)]" />
                  <span className="text-[14px] font-bold text-[var(--text-primary)]">Excel (.xlsx)</span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Native spreadsheet with auto-formatted column widths and headers.
                </p>
              </div>

              {/* CSV Option */}
              <div
                onClick={() => setSelectedFormat('csv')}
                className={cn(
                  'p-3.5 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between relative',
                  selectedFormat === 'csv'
                    ? 'border-[var(--primary)] bg-[var(--accent)] ring-2 ring-[var(--primary)]/20'
                    : 'border-[var(--border-default)] bg-[var(--card)] hover:border-[var(--text-tertiary)]'
                )}
              >
                {selectedFormat === 'csv' && (
                  <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[var(--badge-info-text)]" />
                  <span className="text-[14px] font-bold text-[var(--text-primary)]">CSV (.csv)</span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Standard comma-separated text compatible with all databases and CRMs.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[8px] bg-[var(--surface-secondary)] border border-[var(--border-default)] flex items-center justify-between text-[13px]">
            <span className="text-[var(--text-secondary)]">Total Companies to Export:</span>
            <span className="font-bold text-[var(--text-primary)]">{companies.length} records</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[var(--border-default)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--border-default)] text-[13px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={companies.length === 0}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-[13px] gap-2 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download {selectedFormat.toUpperCase()} ({companies.length})</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
