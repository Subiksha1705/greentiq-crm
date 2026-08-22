'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  UserX,
  Download,
  Trash2,
  X,
} from 'lucide-react';
import { CustomerStatus } from '@/types/customer';

interface BulkActionsBarProps {
  selectedCount: number;
  onUpdateStatus: (status: CustomerStatus) => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  isPending?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onUpdateStatus,
  onExportSelected,
  onDeleteSelected,
  onClearSelection,
  isPending = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-[0_12px_32px_rgba(16,24,40,0.12)] text-[var(--text-primary)]">
        {/* Selected Count Indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-[var(--border-default)]">
          <div className="h-6 w-6 rounded-[6px] bg-[var(--risk-low-bg)] text-[var(--primary)] flex items-center justify-center font-bold text-[12px]">
            {selectedCount}
          </div>
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            Selected
          </span>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus('active')}
            disabled={isPending}
            className="h-8 text-[12px] font-medium border-[var(--border-default)] hover:bg-[var(--accent)] hover:text-[var(--risk-low-text)] hover:border-[var(--accent-green-border)] gap-1.5 px-2.5"
          >
            <UserCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Mark Active</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus('inactive')}
            disabled={isPending}
            className="h-8 text-[12px] font-medium border-[var(--border-default)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)] gap-1.5 px-2.5"
          >
            <UserX className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            <span>Mark Inactive</span>
          </Button>
        </div>

        {/* Export Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={onExportSelected}
          disabled={isPending}
          className="h-8 text-[12px] font-medium border-[var(--border-default)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] gap-1.5 px-2.5"
        >
          <Download className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          <span>Export CSV</span>
        </Button>

        {/* Delete Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={onDeleteSelected}
          disabled={isPending}
          className="h-8 text-[12px] font-medium border-[var(--accent-red-border)] text-[var(--destructive)] hover:bg-[var(--accent-red-bg)] hover:brightness-105 gap-1.5 px-2.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </Button>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-[var(--text-quaternary)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-tertiary)] transition-colors ml-1"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
