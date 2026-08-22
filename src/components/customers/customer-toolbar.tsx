'use client';

import React from 'react';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Plus, RefreshCw, Download, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerToolbarProps {
  searchQuery?: string;
  onSearchChange: (debouncedSearch: string) => void;
  totalCount: number;
  onToggleFilters?: () => void;
  onAddCustomer?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onExportCsv?: () => void;
  activeFilterCount?: number;
  isFetching?: boolean;
  onRefresh?: () => void;
}

export function CustomerToolbar({
  searchQuery = '',
  onSearchChange,
  totalCount,
  onToggleFilters,
  onAddCustomer,
  onExport,
  onImport,
  onExportCsv,
  activeFilterCount = 0,
  isFetching = false,
  onRefresh,
}: CustomerToolbarProps) {
  const handleExportClick = onExport || onExportCsv;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by name, email, or company..."
        />
        {isFetching && (
          <RefreshCw className="h-4 w-4 animate-spin text-[#6B7280] shrink-0" />
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Import Button */}
        {onImport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="h-[36px] px-[12px] py-[8px] gap-1.5 text-[14px] font-medium border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] rounded-[6px] shadow-xs"
            title="Import customers from Excel or CSV file"
          >
            <UploadCloud className="h-4 w-4 text-[#16A34A]" />
            <span>Import</span>
          </Button>
        )}

        {/* Export Button */}
        {handleExportClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
            className="h-[36px] px-[12px] py-[8px] gap-1.5 text-[14px] font-medium border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] rounded-[6px] shadow-xs"
            title="Export customers to Excel or CSV"
          >
            <Download className="h-4 w-4 text-[#4B5563]" />
            <span>Export</span>
          </Button>
        )}

        {/* Filter Drawer Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="h-[36px] px-[16px] py-[8px] gap-2 text-[14px] font-medium border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] rounded-[6px] shadow-xs"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#4B5563]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-0.5 px-1.5 py-0.2 text-[11px] font-semibold bg-[#16A34A] text-white rounded-[4px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Add Customer Button */}
        <Button
          size="sm"
          onClick={onAddCustomer}
          className="h-[36px] px-[16px] py-[8px] gap-1.5 text-[14px] font-semibold bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white rounded-[6px] shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </Button>
      </div>
    </div>
  );
}
