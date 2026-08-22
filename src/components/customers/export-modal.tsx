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
import { Customer } from '@/types/customer';
import { exportCustomers } from '@/lib/export-import';
import { FileSpreadsheet, FileText, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filteredCustomers: Customer[];
  selectedCustomers?: Customer[];
}

export function ExportModal({
  isOpen,
  onOpenChange,
  filteredCustomers,
  selectedCustomers = [],
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exportScope, setExportScope] = useState<'filtered' | 'selected'>(
    selectedCustomers.length > 0 ? 'selected' : 'filtered'
  );

  const dataset =
    exportScope === 'selected' && selectedCustomers.length > 0
      ? selectedCustomers
      : filteredCustomers;

  const handleExport = () => {
    if (dataset.length === 0) {
      toast.error('No customers to export.');
      return;
    }

    exportCustomers(
      dataset,
      selectedFormat,
      exportScope === 'selected' ? 'greentiq_selected_customers' : 'greentiq_filtered_customers'
    );
    toast.success(`Exported ${dataset.length} customer(s) to ${selectedFormat.toUpperCase()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <Download className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[18px] font-bold text-[#1A1D23]">
              Export Customers
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px] text-[#6B7280] pt-1">
            Choose your preferred file format and dataset scope to export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Format Selection Cards */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#374151] uppercase tracking-wider">
              1. Select File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Excel Option */}
              <div
                onClick={() => setSelectedFormat('xlsx')}
                className={cn(
                  'p-3.5 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between relative',
                  selectedFormat === 'xlsx'
                    ? 'border-[#16A34A] bg-[#F0FDF4] ring-2 ring-[#16A34A]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
                )}
              >
                {selectedFormat === 'xlsx' && (
                  <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-5 w-5 text-[#16A34A]" />
                  <span className="text-[14px] font-bold text-[#1A1D23]">Excel (.xlsx)</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Native spreadsheet with auto-formatted column widths and headers.
                </p>
              </div>

              {/* CSV Option */}
              <div
                onClick={() => setSelectedFormat('csv')}
                className={cn(
                  'p-3.5 rounded-[10px] border cursor-pointer transition-all flex flex-col justify-between relative',
                  selectedFormat === 'csv'
                    ? 'border-[#16A34A] bg-[#F0FDF4] ring-2 ring-[#16A34A]/20'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
                )}
              >
                {selectedFormat === 'csv' && (
                  <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[#2563EB]" />
                  <span className="text-[14px] font-bold text-[#1A1D23]">CSV (.csv)</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Standard comma-separated text compatible with all databases and CRMs.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Scope Selection */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[#374151] uppercase tracking-wider">
              2. Select Dataset Scope
            </label>
            <div className="space-y-2">
              <label
                className={cn(
                  'flex items-center justify-between p-3 rounded-[8px] border cursor-pointer transition-colors',
                  exportScope === 'filtered' ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'filtered'}
                    onChange={() => setExportScope('filtered')}
                    className="accent-[#16A34A] h-4 w-4"
                  />
                  <div>
                    <span className="text-[13px] font-semibold text-[#1A1D23] block">
                      All Matching / Filtered Customers
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Exports current view dataset ({filteredCustomers.length} records)
                    </span>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#1A1D23] bg-[#E5E7EB] px-2 py-0.5 rounded">
                  {filteredCustomers.length} rows
                </span>
              </label>

              {selectedCustomers.length > 0 && (
                <label
                  className={cn(
                    'flex items-center justify-between p-3 rounded-[8px] border cursor-pointer transition-colors',
                    exportScope === 'selected' ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'selected'}
                      onChange={() => setExportScope('selected')}
                      className="accent-[#16A34A] h-4 w-4"
                    />
                    <div>
                      <span className="text-[13px] font-semibold text-[#1A1D23] block">
                        Selected Rows Only
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        Exports only explicitly checked table rows
                      </span>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                    {selectedCustomers.length} selected
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#E5E7EB]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#D1D5DB] text-[13px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={dataset.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[13px] gap-2 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download {selectedFormat.toUpperCase()} ({dataset.length})</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
