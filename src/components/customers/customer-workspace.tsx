'use client';

import React, { useState, useMemo } from 'react';
import { useCustomerFilters } from '@/hooks/use-customer-filters';
import { useCustomers } from '@/hooks/use-customers';
import { CustomerToolbar } from './customer-toolbar';
import { CustomerTable } from './customer-table';
import { CustomerFilters } from './customer-filters';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { FilterChip } from '@/components/common/filter-chip';
import { CustomerSortState } from '@/types/customer';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomerWorkspace() {
  const {
    params,
    setSearch,
    setSorting,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    activeFilterCount,
    activeFilterChips,
  } = useCustomerFilters();

  const { data, isLoading, isError, error, refetch, isFetching } = useCustomers(params);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Extract unique company options from current result set or available mock data
  const companyOptions = useMemo(() => {
    if (!data?.data) return [];
    const set = new Set<string>();
    data.data.forEach((c) => {
      if (c.company) set.add(c.company);
    });
    return Array.from(set).sort();
  }, [data?.data]);

  const handleSortChange = (column: NonNullable<CustomerSortState['sortBy']>) => {
    setSorting(column);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account relationships, risk indicators, and recent contact touchpoints.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <CustomerToolbar
        searchQuery={params.search}
        onSearchChange={setSearch}
        totalCount={data?.total ?? 0}
        activeFilterCount={activeFilterCount}
        onToggleFilters={() => setIsFiltersOpen(true)}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      {/* Active Filter Chips Bar */}
      {activeFilterChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 p-3 bg-muted/30 border rounded-lg text-xs">
          <span className="font-semibold text-muted-foreground mr-1">Active Filters:</span>
          {activeFilterChips.map((chip) => (
            <FilterChip
              key={chip.id}
              category={chip.category}
              label={chip.label}
              onRemove={chip.onRemove}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive ml-auto gap-1"
          >
            <X className="h-3 w-3" />
            <span>Clear All</span>
          </Button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-6 border border-destructive/20 rounded-xl bg-destructive/5 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            Failed to load customers
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching customer data.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading state vs Table */}
      {isLoading ? (
        <LoadingState variant="table" count={params.pageSize || 10} />
      ) : data ? (
        <div className="space-y-4">
          <CustomerTable
            customers={data.data}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSortChange={handleSortChange}
            onSelectCustomer={handleSelectCustomer}
            onClearFilters={clearFilters}
          />

          <DataTablePagination
            page={data.page}
            pageSize={data.pageSize}
            totalItems={data.total}
            totalPages={data.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : null}

      {/* Advanced Filter Drawer */}
      <CustomerFilters
        isOpen={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        committedFilters={{
          status: params.status,
          company: params.company,
          risk: params.risk,
          lastContactFrom: params.lastContactFrom,
          lastContactTo: params.lastContactTo,
          email: params.email,
          phone: params.phone,
        }}
        onApplyFilters={setFilters}
        onClearAll={clearFilters}
        companyOptions={companyOptions}
      />
    </div>
  );
}
