'use client';

import React from 'react';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerToolbarProps {
  searchQuery?: string;
  onSearchChange: (debouncedSearch: string) => void;
  totalCount: number;
  onToggleFilters?: () => void;
  onAddCustomer?: () => void;
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
  activeFilterCount = 0,
  isFetching = false,
  onRefresh,
}: CustomerToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by name, email, or company..."
        />
        {isFetching && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Filter Drawer Toggle Seam (Phase 4) */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="h-9 gap-2 text-xs font-medium"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Add Customer Seam (Phase 7) */}
        <Button
          size="sm"
          onClick={onAddCustomer}
          className="h-9 gap-1.5 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Customer</span>
        </Button>
      </div>
    </div>
  );
}
