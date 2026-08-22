'use client';

import React, { useState } from 'react';
import { useCompanies } from '@/hooks/use-companies';
import { useCreateCompany } from '@/hooks/use-create-company';
import { useUpdateCompany } from '@/hooks/use-update-company';
import { useDeleteCompany } from '@/hooks/use-delete-company';
import {
  CompanyWithStats,
  CompanyIndustry,
  CompanyTier,
  CreateCompanyInput,
  CompanySortState,
} from '@/types/company';
import { CompanyForm } from './company-form';
import { CompanyDetails } from './company-details';
import { CompanyImportModal } from './company-import-modal';
import { CompanyExportModal } from './company-export-modal';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { SearchInput } from '@/components/common/search-input';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Plus,
  Users,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Download,
  UploadCloud,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';

const TIERS: (CompanyTier | 'all')[] = ['all', 'Enterprise', 'Mid-Market', 'SMB', 'Startup'];

const INDUSTRIES: (CompanyIndustry | 'all')[] = [
  'all',
  'Technology',
  'Healthcare',
  'Financial Services',
  'Energy & CleanTech',
  'Retail',
  'Manufacturing',
  'Media',
  'Real Estate',
  'Other',
];

export function CompanyWorkspace() {
  // State
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<CompanyTier | 'all'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<CompanyIndustry | 'all'>('all');
  const [sortBy, setSortBy] = useState<NonNullable<CompanySortState['sortBy']>>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialogs
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithStats | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanyWithStats | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useCompanies({
    search: search || undefined,
    tier: selectedTier !== 'all' ? [selectedTier] : undefined,
    industry: selectedIndustry !== 'all' ? [selectedIndustry] : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  // Summary Metrics calculations
  const companies = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const enterpriseCount = companies.filter((c) => c.tier === 'Enterprise').length;
  const totalContactsSum = companies.reduce((acc, c) => acc + c.totalContacts, 0);
  const activeContactsSum = companies.reduce((acc, c) => acc + c.activeContacts, 0);

  // Handlers
  const handleCreateSubmit = async (values: CreateCompanyInput) => {
    try {
      await createCompanyMutation.mutateAsync(values);
      toast.success(`Company "${values.name}" created successfully!`);
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create company.');
    }
  };

  const handleEditSubmit = async (values: CreateCompanyInput) => {
    if (!editingCompany) return;
    try {
      await updateCompanyMutation.mutateAsync({
        id: editingCompany.id,
        input: values,
      });
      toast.success(`Company "${values.name}" updated successfully!`);
      setEditingCompany(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update company.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCompany) return;
    try {
      await deleteCompanyMutation.mutateAsync(deletingCompany.id);
      toast.success(`Company "${deletingCompany.name}" deleted.`);
      if (selectedCompanyId === deletingCompany.id) {
        setSelectedCompanyId(null);
      }
      setDeletingCompany(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete company.');
    }
  };

  const toggleSort = (column: NonNullable<CompanySortState['sortBy']>) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--border-default)] font-semibold';
      case 'Mid-Market':
        return 'bg-[var(--accent)] text-[var(--primary)] border-[var(--border-default)] font-semibold';
      case 'Startup':
        return 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border-[var(--border-default)] font-medium';
      default:
        return 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] border-[var(--border-default)] font-medium';
    }
  };

  const renderSortIcon = (column: NonNullable<CompanySortState['sortBy']>) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-[var(--primary)]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[var(--primary)]" />
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
            Companies & Account Groups
          </h1>
          <p className="text-[14px] text-[var(--text-tertiary)] mt-1">
            Manage corporate client accounts, tier segments, and cross-team contact portfolios.
          </p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.03em]">
              Total Companies
            </span>
            <div className="p-2 rounded-lg bg-[var(--accent)] text-[var(--primary)]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2">
            {totalCount}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            Registered corporate clients
          </p>
        </div>

        <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.03em]">
              Enterprise Accounts
            </span>
            <div className="p-2 rounded-lg bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2">
            {enterpriseCount}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            High-value strategic tiers
          </p>
        </div>

        <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.03em]">
              Linked Contacts
            </span>
            <div className="p-2 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-primary)]">
              <Users className="h-4 w-4 text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2">
            {totalContactsSum}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            Stakeholders across accounts
          </p>
        </div>

        <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-tertiary)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.03em]">
              Active Contacts
            </span>
            <div className="p-2 rounded-lg bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2">
            {activeContactsSum}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
            Engaged customer contacts
          </p>
        </div>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="p-4 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search companies by name, industry, location..."
            />
          </div>

          {/* Filters & Actions Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Import Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="h-9 px-3 gap-1.5 text-[13px] font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] rounded-[6px]"
              title="Import companies from Excel or CSV file"
            >
              <UploadCloud className="h-4 w-4 text-[var(--primary)]" />
              <span>Import</span>
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="h-9 px-3 gap-1.5 text-[13px] font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] rounded-[6px]"
              title="Export companies to Excel or CSV"
            >
              <Download className="h-4 w-4 text-[var(--text-secondary)]" />
              <span>Export</span>
            </Button>

            {/* Tier Filter */}
            <Select
              value={selectedTier}
              onValueChange={(val) => {
                setSelectedTier(val as CompanyTier | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[13px] w-[130px] sm:w-[140px] bg-[var(--surface-secondary)] border-[var(--border-default)] text-[var(--text-primary)]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--popover)] border-[var(--border-default)]">
                {TIERS.map((t) => (
                  <SelectItem key={t} value={t} className="text-[13px]">
                    {t === 'all' ? 'All Tiers' : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select
              value={selectedIndustry}
              onValueChange={(val) => {
                setSelectedIndustry(val as CompanyIndustry | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[13px] w-[140px] sm:w-[160px] bg-[var(--surface-secondary)] border-[var(--border-default)] text-[var(--text-primary)]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--popover)] border-[var(--border-default)]">
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind} className="text-[13px]">
                    {ind === 'all' ? 'All Industries' : ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] p-0.5">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-2.5 text-[12px] text-[var(--text-primary)]"
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-2.5 text-[12px] text-[var(--text-primary)]"
                title="Grouped Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Company Button */}
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-3.5 gap-1.5 text-[13px] font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white rounded-[6px] shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Company</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState variant="table" />
      ) : isError ? (
        <ErrorState
          title="Failed to load companies"
          description="Could not load company records. Please check your connection and try again."
          onRetry={() => {
            refetch();
          }}
        />
      ) : companies.length === 0 ? (
        <div className="p-12 text-center rounded-[12px] bg-[var(--card)] border border-[var(--border-default)]">
          <Building2 className="h-10 w-10 mx-auto text-[var(--text-quaternary)] mb-3" />
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
            No company records found
          </h3>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
            {search || selectedTier !== 'all' || selectedIndustry !== 'all'
              ? 'Try adjusting your search criteria or filter selections.'
              : 'Add your first corporate client account to begin grouping contacts.'}
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 bg-[var(--primary)] text-white text-[13px] gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Company</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            /* Table View */
            <div className="w-full border border-[var(--border-default)] rounded-[8px] overflow-x-auto bg-[var(--card)] shadow-xs">
              <table className="w-full text-left text-[14px] min-w-[750px]">
                <thead className="bg-[var(--surface-secondary)] border-b border-[var(--border-default)] text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-quaternary)]">
                  <tr>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-[var(--text-primary)] group"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Company Name</span>
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-[var(--text-primary)] group"
                      onClick={() => toggleSort('industry')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Industry</span>
                        {renderSortIcon('industry')}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-[var(--text-primary)] group"
                      onClick={() => toggleSort('tier')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Tier</span>
                        {renderSortIcon('tier')}
                      </div>
                    </th>
                    <th className="py-3 px-4">Location</th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:text-[var(--text-primary)] group"
                      onClick={() => toggleSort('totalContacts')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Total Contacts</span>
                        {renderSortIcon('totalContacts')}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:text-[var(--text-primary)] group"
                      onClick={() => toggleSort('activeContacts')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Active Contacts</span>
                        {renderSortIcon('activeContacts')}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      onClick={() => setSelectedCompanyId(company.id)}
                      className="hover:bg-[var(--surface-tertiary)] cursor-pointer transition-colors group"
                    >
                      {/* Name & Website */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center font-bold text-[14px] shrink-0 border border-[var(--border-default)]">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                              {company.name}
                            </p>
                            {company.website && (
                              <p className="text-[12px] text-[var(--text-tertiary)] truncate">
                                {company.website.replace(/^https?:\/\//, '')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {company.industry}
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className={getTierBadgeClass(company.tier)}
                        >
                          {company.tier}
                        </Badge>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[var(--text-tertiary)] text-[13px]">
                        {company.location || '—'}
                      </td>

                      {/* Total Contacts */}
                      <td className="py-3.5 px-4 text-center font-bold text-[var(--text-primary)]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                          <Users className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          <span>{company.totalContacts}</span>
                        </div>
                      </td>

                      {/* Active Contacts */}
                      <td className="py-3.5 px-4 text-center font-bold text-[var(--text-primary)]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--badge-success-text)]" />
                          <span>{company.activeContacts}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCompany(company)}
                            className="h-8 w-8 p-0 text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--surface-tertiary)]"
                            title="Edit Company"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCompany(company)}
                            className="h-8 w-8 p-0 text-[var(--text-tertiary)] hover:text-[var(--destructive)] hover:bg-[var(--surface-tertiary)]"
                            title="Delete Company"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCompanyId(company.id)}
                            className="h-8 w-8 p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
                            title="View Details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grouped Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className="p-5 rounded-[12px] bg-[var(--card)] border border-[var(--border-default)] shadow-xs hover:border-[var(--primary)]/50 cursor-pointer transition-all flex flex-col justify-between group space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-[10px] bg-[var(--primary)] text-white flex items-center justify-center font-bold text-[16px] shadow-xs">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-[16px] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {company.name}
                          </h4>
                          <p className="text-[12px] text-[var(--text-tertiary)]">{company.industry}</p>
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-semibold ${getTierBadgeClass(company.tier)}`}
                      >
                        {company.tier}
                      </Badge>
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-[13px] text-[var(--text-secondary)] mt-3 line-clamp-2 leading-relaxed">
                        {company.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <span className="font-bold text-[var(--text-primary)]">
                        {company.totalContacts}
                      </span>
                      <span>total contacts</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--badge-success-text)]" />
                      <span className="font-bold text-[var(--text-primary)]">
                        {company.activeContacts}
                      </span>
                      <span>active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DataTablePagination */}
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      )}

      {/* Company Details Side Drawer */}
      <CompanyDetails
        companyId={selectedCompanyId}
        isOpen={Boolean(selectedCompanyId)}
        onClose={() => setSelectedCompanyId(null)}
        onEdit={(id) => {
          const comp = companies.find((c) => c.id === id);
          if (comp) setEditingCompany(comp);
        }}
        onDelete={(id) => {
          const comp = companies.find((c) => c.id === id);
          if (comp) setDeletingCompany(comp);
        }}
      />

      {/* Create Company Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[var(--text-primary)]">
              Add New Company Account
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--text-tertiary)]">
              Register a corporate client profile to track account tier, contacts, and portfolios.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <CompanyForm
              mode="create"
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateOpen(false)}
              isSubmitting={createCompanyMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog
        open={Boolean(editingCompany)}
        onOpenChange={(open) => !open && setEditingCompany(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[var(--text-primary)]">
              Edit Company Profile
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--text-tertiary)]">
              Update organization info, account tier classification, and strategy notes.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            {editingCompany && (
              <CompanyForm
                mode="edit"
                defaultValues={editingCompany}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingCompany(null)}
                isSubmitting={updateCompanyMutation.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Import Modal */}
      <CompanyImportModal
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
      />

      {/* Company Export Modal */}
      <CompanyExportModal
        isOpen={isExportOpen}
        onOpenChange={setIsExportOpen}
        companies={companies}
      />

      {/* Delete Company Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCompany)}
        onOpenChange={(open) => !open && setDeletingCompany(null)}
        title="Delete Company Account"
        description={`Are you sure you want to delete "${deletingCompany?.name}"? Linked contacts will retain their customer records.`}
        confirmLabel="Delete Company"
        variant="destructive"
        isPending={deleteCompanyMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
