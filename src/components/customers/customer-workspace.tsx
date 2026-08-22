'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCustomerFilters } from '@/hooks/use-customer-filters';
import { useSavedViews } from '@/hooks/use-saved-views';
import { useCustomers } from '@/hooks/use-customers';
import { useCustomer } from '@/hooks/use-customer';
import { useCreateCustomer } from '@/hooks/use-create-customer';
import { useUpdateCustomer } from '@/hooks/use-update-customer';
import { useDeleteCustomer } from '@/hooks/use-delete-customer';
import { useCustomerFilterOptions } from '@/hooks/use-customer-filter-options';
import { useCustomersByIds } from '@/hooks/use-customers-by-ids';
import { useAllFilteredCustomers } from '@/hooks/use-all-filtered-customers';
import { useQueryClient } from '@tanstack/react-query';
import { customerKeys } from '@/lib/query-keys';
import { bulkUpdateCustomerStatus, bulkDeleteCustomers } from '@/lib/api/customers';
import { CustomerToolbar } from './customer-toolbar';
import { CustomerTable } from './customer-table';
import { CustomerFilters } from './customer-filters';
import { CustomerDetails } from './customer-details';
import { CustomerForm } from './customer-form';
import { BulkActionsBar } from './bulk-actions-bar';
import { ExportModal } from './export-modal';
import { ImportModal } from './import-modal';
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
import { CustomerSortState, CustomerStatus } from '@/types/customer';
import { CustomerFormValues } from '@/lib/validations/customer';
import { StatusBadge } from '@/components/common/status-badge';
import { FollowUpRiskBadge } from '@/components/customers/follow-up-risk-badge';
import { getFollowUpRisk } from '@/lib/customer-rules';
import { formatDateSafely } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  X,
  Building2,
  Mail,
  Phone,
  Clock,
  Pencil,
  Trash2,
  ChevronRight,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CustomerWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const { saveCustomView } = useSavedViews();

  const { data, isLoading, isError, refetch, isFetching } = useCustomers(params);
  const { data: filterOptionsData } = useCustomerFilterOptions();
  const companyOptions = filterOptionsData?.companies ?? [];

  // Mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Drawer & Modal states
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Bulk Selection States
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Full datasets for export (unpaginated filtered set & cross-page selected set)
  const { data: allFilteredCustomers = [] } = useAllFilteredCustomers(params, isExportModalOpen);
  const { data: selectedCustomersData = [] } = useCustomersByIds(
    selectedCustomerIds,
    isExportModalOpen && selectedCustomerIds.length > 0
  );

  // Handle Quick Actions from Command Palette or URL query parameters
  const actionParam = searchParams.get('action');
  const [handledAction, setHandledAction] = useState<string | null>(null);

  if (actionParam && actionParam !== handledAction) {
    setHandledAction(actionParam);
    if (actionParam === 'add') {
      setIsCreateOpen(true);
    } else if (actionParam === 'filter') {
      setIsFiltersOpen(true);
    } else if (actionParam === 'export') {
      setIsExportModalOpen(true);
    } else if (actionParam === 'import') {
      setIsImportModalOpen(true);
    }
  }

  useEffect(() => {
    if (!actionParam) return;
    // Clean up action param from URL without triggering full reload
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('action');
    const newQuery = current.toString() ? `?${current.toString()}` : '';
    router.replace(`${pathname}${newQuery}`, { scroll: false });
  }, [actionParam, searchParams, pathname, router]);

  // Active customer for editing
  const { data: editingCustomer } = useCustomer(editingCustomerId);

  const handleSortChange = (column: NonNullable<CustomerSortState['sortBy']>) => {
    setSorting(column);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
  };

  // Bulk selection toggles
  const handleToggleSelectCustomer = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (!data?.data) return;
    const currentPageIds = data.data.map((c) => c.id);
    const allSelected = currentPageIds.every((id) => selectedCustomerIds.includes(id));

    if (allSelected) {
      setSelectedCustomerIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedCustomerIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedCustomerIds([]);
  };

  // Bulk Action: Status Change
  const handleBulkUpdateStatus = async (status: CustomerStatus) => {
    if (selectedCustomerIds.length === 0) return;
    try {
      setIsBulkPending(true);
      const res = await bulkUpdateCustomerStatus(selectedCustomerIds, status);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });
      toast.success(`Updated ${res.updatedCount} customer(s) to ${status}`);
      setSelectedCustomerIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update selected customers');
    } finally {
      setIsBulkPending(false);
    }
  };

  // Bulk Action: Delete Selected
  const handleConfirmBulkDelete = async () => {
    if (selectedCustomerIds.length === 0) return;
    try {
      setIsBulkPending(true);
      const res = await bulkDeleteCustomers(selectedCustomerIds);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });

      // If open customer was deleted, close drawer
      if (selectedCustomerId && selectedCustomerIds.includes(selectedCustomerId)) {
        setSelectedCustomerId(null);
      }

      toast.success(`Deleted ${res.deletedCount} customer record(s)`);
      setSelectedCustomerIds([]);
      setIsBulkDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete selected customers');
    } finally {
      setIsBulkPending(false);
    }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
        activeFilterCount={activeFilterCount}
        onToggleFilters={() => setIsFiltersOpen(true)}
        onAddCustomer={() => setIsCreateOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        isFetching={isFetching}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Active Filter Chips Bar */}
      {activeFilterChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 p-3 bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-lg text-xs">
          <span className="font-semibold text-[var(--text-tertiary)] mr-1">Active Filters:</span>
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
            className="h-7 px-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--destructive)] ml-auto gap-1"
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

      {/* Loading state vs Content */}
      {isLoading ? (
        <LoadingState variant="table" count={params.pageSize || 10} />
      ) : data ? (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <CustomerTable
              customers={data.data}
              sortBy={params.sortBy}
              sortOrder={params.sortOrder}
              onSortChange={handleSortChange}
              onSelectCustomer={handleSelectCustomer}
              onClearFilters={clearFilters}
              selectedCustomerIds={selectedCustomerIds}
              onToggleSelectCustomer={handleToggleSelectCustomer}
              onToggleSelectAll={handleToggleSelectAll}
            />
          ) : (
            /* Cards View */
            <div className="space-y-4">
              {data.data.length === 0 ? (
                <div className="p-12 text-center rounded-[12px] bg-[var(--card)] border border-[var(--border-default)]">
                  <User className="h-10 w-10 mx-auto text-[var(--text-quaternary)] mb-3" />
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                    No customers found
                  </h3>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
                    Try adjusting your search criteria or filter selections.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4 text-[13px] border-[var(--border-default)]"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.data.map((customer) => {
                    const isSelected = selectedCustomerIds.includes(customer.id);
                    const risk = getFollowUpRisk(customer.lastContactDate);
                    return (
                      <div
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer.id)}
                        className={`p-4 rounded-[12px] bg-[var(--card)] border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group shadow-xs hover:border-[var(--primary)]/50 ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--accent)]/30'
                            : 'border-[var(--border-default)]'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleSelectCustomer(customer.id)}
                                aria-label={`Select ${customer.name}`}
                              />
                            </div>
                            <Avatar className="h-9 w-9 border border-[var(--border-default)] shrink-0">
                              <AvatarFallback className="bg-[var(--surface-tertiary)] text-[var(--text-primary)] text-[12px] font-semibold">
                                {customer.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[14px] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                                {customer.name}
                              </h4>
                              <p className="text-[12px] text-[var(--text-tertiary)] flex items-center gap-1 truncate">
                                <Building2 className="h-3 w-3 shrink-0 text-[var(--text-quaternary)]" />
                                <span className="truncate">{customer.company}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <StatusBadge status={customer.status} />
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1.5 text-[12px] text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Last contact: {formatDateSafely(customer.lastContactDate)}</span>
                          </div>
                        </div>

                        {/* Notes preview */}
                        {customer.notes && (
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1 italic">
                            &quot;{customer.notes}&quot;
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="pt-2.5 border-t border-[var(--border-default)] flex items-center justify-between">
                          <FollowUpRiskBadge risk={risk} compact />

                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCustomerId(customer.id)}
                              className="h-7 w-7 p-0 text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--surface-tertiary)]"
                              title="Edit Customer"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCustomerId(customer.id)}
                              className="h-7 w-7 p-0 text-[var(--text-tertiary)] hover:text-[var(--destructive)] hover:bg-[var(--surface-tertiary)]"
                              title="Delete Customer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectCustomer(customer.id)}
                              className="h-7 w-7 p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
                              title="View Details"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
        onSaveView={saveCustomView}
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

      {/* Single Delete Confirmation Dialog */}
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

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title={`Delete ${selectedCustomerIds.length} Customer Records`}
        description={`Are you sure you want to permanently delete the ${selectedCustomerIds.length} selected customer records? This cannot be undone.`}
        confirmLabel="Delete Selected Customers"
        variant="destructive"
        isPending={isBulkPending}
        onConfirm={handleConfirmBulkDelete}
      />

      {/* Floating Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCustomerIds.length}
        onUpdateStatus={handleBulkUpdateStatus}
        onExportSelected={() => setIsExportModalOpen(true)}
        onDeleteSelected={() => setIsBulkDeleteOpen(true)}
        onClearSelection={handleClearSelection}
        isPending={isBulkPending}
      />

      {/* Export Modal (Excel & CSV) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        filteredCustomers={allFilteredCustomers}
        selectedCustomers={selectedCustomersData}
      />

      {/* Import Modal (Excel & CSV) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
}
