'use client';

import React, { useState, useMemo } from 'react';
import { useCustomerFilters } from '@/hooks/use-customer-filters';
import { useCustomers } from '@/hooks/use-customers';
import { useCustomer } from '@/hooks/use-customer';
import { useCreateCustomer } from '@/hooks/use-create-customer';
import { useUpdateCustomer } from '@/hooks/use-update-customer';
import { useDeleteCustomer } from '@/hooks/use-delete-customer';
import { CustomerToolbar } from './customer-toolbar';
import { CustomerTable } from './customer-table';
import { CustomerFilters } from './customer-filters';
import { CustomerDetails } from './customer-details';
import { CustomerForm } from './customer-form';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterChip } from '@/components/common/filter-chip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CustomerSortState } from '@/types/customer';
import { CustomerFormValues } from '@/lib/validations/customer';
import { X } from 'lucide-react';
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

  const { data, isLoading, isError, refetch, isFetching } = useCustomers(params);

  // Mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Drawer & Modal states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Active customer for editing
  const { data: editingCustomer } = useCustomer(editingCustomerId);

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

  // Create Customer Handler
  const handleCreateCustomer = async (values: CustomerFormValues) => {
    await createCustomerMutation.mutateAsync({
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      status: values.status,
      lastContactDate: values.lastContactDate,
      notes: values.notes,
    });
    setIsCreateOpen(false);
  };

  // Edit Customer Handler
  const handleEditCustomer = async (values: CustomerFormValues) => {
    if (!editingCustomerId) return;
    await updateCustomerMutation.mutateAsync({
      id: editingCustomerId,
      input: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        company: values.company,
        status: values.status,
        lastContactDate: values.lastContactDate,
        notes: values.notes,
      },
    });
    setEditingCustomerId(null);
  };

  // Delete Customer Handler (§7 Delete-while-open behavior)
  const handleDeleteCustomer = async () => {
    if (!deletingCustomerId) return;
    const targetId = deletingCustomerId;

    await deleteCustomerMutation.mutateAsync(targetId);

    // If the customer currently open in the details drawer is deleted, close drawer & clear selection
    if (selectedCustomerId === targetId) {
      setSelectedCustomerId(null);
    }
    setDeletingCustomerId(null);
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
        onAddCustomer={() => setIsCreateOpen(true)}
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
        <ErrorState
          title="Something went wrong"
          description="We were unable to load the customer records. Please check your connection and try again."
          onRetry={() => refetch()}
        />
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

      {/* Customer Details Drawer */}
      <CustomerDetails
        customerId={selectedCustomerId}
        isOpen={Boolean(selectedCustomerId)}
        onClose={() => setSelectedCustomerId(null)}
        onEdit={(id) => setEditingCustomerId(id)}
        onDelete={(id) => setDeletingCustomerId(id)}
      />

      {/* Add Customer Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#1A1D23]">
              Add New Customer
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6B7280]">
              Create a new customer account record with initial contact dates and details.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <CustomerForm
              mode="create"
              onSubmit={handleCreateCustomer}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={createCustomerMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog
        open={Boolean(editingCustomerId)}
        onOpenChange={(open) => !open && setEditingCustomerId(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[#1A1D23]">
              Edit Customer
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6B7280]">
              Update contact information, status, and account notes for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            {editingCustomer ? (
              <CustomerForm
                key={editingCustomer.id}
                mode="edit"
                defaultValues={editingCustomer}
                onSubmit={handleEditCustomer}
                onCancel={() => setEditingCustomerId(null)}
                isSubmitting={updateCustomerMutation.isPending}
              />
            ) : (
              <LoadingState variant="detail" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCustomerId)}
        onOpenChange={(open) => !open && setDeletingCustomerId(null)}
        title="Delete Customer Record"
        description="Are you sure you want to delete this customer? This action will permanently remove their records, contact recency history, and logs from the workspace."
        confirmLabel="Delete Customer"
        variant="destructive"
        isPending={deleteCustomerMutation.isPending}
        onConfirm={handleDeleteCustomer}
      />
    </div>
  );
}
