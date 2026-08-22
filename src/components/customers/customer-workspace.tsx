'use client';

import React, { useState } from 'react';
import { useCustomerFilters } from '@/hooks/use-customer-filters';
import { useCustomers } from '@/hooks/use-customers';
import { CustomerToolbar } from './customer-toolbar';
import { CustomerTable } from './customer-table';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { CustomerSortState } from '@/types/customer';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomerWorkspace() {
  const {
    params,
    setSearch,
    setSorting,
    setPage,
    setPageSize,
    clearFilters,
  } = useCustomerFilters();

  const { data, isLoading, isError, error, refetch, isFetching } = useCustomers(params);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

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
    </div>
  );
}
