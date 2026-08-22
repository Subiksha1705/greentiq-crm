'use client';

import React from 'react';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Plus, RefreshCw, Download, UploadCloud, List, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerToolbarProps {
  searchQuery?: string;
  onSearchChange: (debouncedSearch: string) => void;
  onToggleFilters?: () => void;
  onAddCustomer?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onExportCsv?: () => void;
  activeFilterCount?: number;
  isFetching?: boolean;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export function CustomerToolbar({
  searchQuery = '',
  onSearchChange,
  onToggleFilters,
  onAddCustomer,
  onExport,
  onImport,
  onExportCsv,
  activeFilterCount = 0,
  isFetching = false,
  viewMode = 'table',
  onViewModeChange,
}: CustomerToolbarProps) {
  const handleExportClick = onExport || onExportCsv;

  return (
    <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-md flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by name, email, or company..."
            />
          </div>
          {isFetching && (
            <RefreshCw className="h-4 w-4 animate-spin text-[var(--text-tertiary)] shrink-0" />
          )}
        </div>

        {/* Action Controls - Flex wrap on mobile to keep all actions reachable */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import Button */}
          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className="h-9 px-3 gap-1.5 text-[13px] font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] rounded-[6px]"
              title="Import customers from Excel or CSV file"
            >
              <UploadCloud className="h-4 w-4 text-[var(--primary)]" />
              <span>Import</span>
            </Button>
          )}

          {/* Export Button */}
          {handleExportClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportClick}
              className="h-9 px-3 gap-1.5 text-[13px] font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] rounded-[6px]"
              title="Export customers to Excel or CSV"
            >
              <Download className="h-4 w-4 text-[var(--text-secondary)]" />
              <span>Export</span>
            </Button>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-0.5">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="h-8 px-2.5 text-[12px] text-[var(--text-primary)]"
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('cards')}
                className="h-8 px-2.5 text-[12px] text-[var(--text-primary)]"
                title="Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Filter Drawer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="h-9 px-3.5 gap-2 text-[13px] font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] rounded-[6px]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-0.5 px-1.5 py-0.2 text-[11px] font-semibold bg-[var(--primary)] text-white rounded-[4px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Add Customer Button */}
          {onAddCustomer && (
            <Button
              size="sm"
              onClick={onAddCustomer}
              className="h-9 px-3.5 gap-1.5 text-[13px] font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white rounded-[6px] shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
