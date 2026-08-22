'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-3 px-3.5 py-3 border-t border-[var(--border-default)] text-[13px] text-[var(--text-secondary)] bg-[var(--card)] rounded-b-[8px] ${className}`}
    >
      {/* Items count summary */}
      <div className="flex items-center text-center sm:text-left text-[12px] sm:text-[13px]">
        <span>
          Showing <strong className="font-semibold text-[var(--text-primary)]">{startItem}</strong> to{' '}
          <strong className="font-semibold text-[var(--text-primary)]">{endItem}</strong> of{' '}
          <strong className="font-semibold text-[var(--text-primary)]">{totalItems}</strong> entries
        </span>
      </div>

      {/* Controls: wraps gracefully on mobile without overflowing */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 w-full md:w-auto">
        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[12px] font-medium text-[var(--text-tertiary)] whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[65px] border-[var(--border-default)] rounded-[6px] text-[13px] bg-[var(--surface-secondary)]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top" className="bg-[var(--popover)] border-[var(--border-default)] rounded-[8px]">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)} className="text-[13px]">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[12px] font-medium text-[var(--text-tertiary)] mr-1.5 whitespace-nowrap">
            Page <strong className="font-semibold text-[var(--text-primary)]">{page}</strong> of{' '}
            <strong className="font-semibold text-[var(--text-primary)]">{Math.max(1, totalPages)}</strong>
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0 border-[var(--border-default)] rounded-[6px] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0 border-[var(--border-default)] rounded-[6px] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0 border-[var(--border-default)] rounded-[6px] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 p-0 border-[var(--border-default)] rounded-[6px] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
