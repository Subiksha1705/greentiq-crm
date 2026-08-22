'use client';

import React, { useState } from 'react';
import { useCompany } from '@/hooks/use-company';
import { useCreateCustomer } from '@/hooks/use-create-customer';
import { useUpdateCustomer } from '@/hooks/use-update-customer';
import { useAllFilteredCustomers } from '@/hooks/use-all-filtered-customers';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { FollowUpRiskBadge } from '@/components/customers/follow-up-risk-badge';
import { getFollowUpRisk } from '@/lib/customer-rules';
import { CustomerForm } from '@/components/customers/customer-form';
import { CustomerDetails as CustomerDrawer } from '@/components/customers/customer-details';
import { CustomerFormValues } from '@/lib/validations/customer';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Globe,
  MapPin,
  Users,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Mail,
  Phone,
  ArrowRight,
  UserPlus,
  Link2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface CompanyDetailsProps {
  companyId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (companyId: string) => void;
  onDelete?: (companyId: string) => void;
}

export function CompanyDetails({
  companyId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CompanyDetailsProps) {
  const { data: company, isLoading, isError, refetch } = useCompany(companyId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [addContactMode, setAddContactMode] = useState<'select' | 'create'>('select');
  const [selectedContactIdToLink, setSelectedContactIdToLink] = useState<string>('');
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  // Fetch all customers when modal is open so any contact can be selected
  const { data: allCustomers = [], isLoading: isLoadingAllCustomers } = useAllFilteredCustomers(
    {},
    isAddContactModalOpen
  );

  if (!isOpen) return null;

  // Filter out contacts already linked to this company
  const availableToLink = allCustomers.filter(
    (c) => (c.company || '').toLowerCase().trim() !== (company?.name || '').toLowerCase().trim()
  );

  const selectedContactToLink = allCustomers.find((c) => c.id === selectedContactIdToLink);

  const handleLinkExistingContact = async () => {
    if (!selectedContactIdToLink || !company) return;
    try {
      await updateCustomerMutation.mutateAsync({
        id: selectedContactIdToLink,
        input: { company: company.name },
      });
      toast.success(`Contact linked to ${company.name}`);
      setIsAddContactModalOpen(false);
      setSelectedContactIdToLink('');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link contact.');
    }
  };

  const handleCreateContactSubmit = async (values: CustomerFormValues) => {
    if (!company) return;
    try {
      await createCustomerMutation.mutateAsync({
        ...values,
        company: company.name,
      });
      toast.success(`Contact "${values.name}" created and linked to ${company.name}`);
      setIsAddContactModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create contact.');
    }
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--border-default)]';
      case 'Mid-Market':
        return 'bg-[var(--accent)] text-[var(--primary)] border-[var(--border-default)]';
      default:
        return 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] border-[var(--border-default)]';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl flex flex-col h-full bg-[var(--card)] text-[var(--foreground)] p-0"
        >
          {isLoading ? (
            <div className="p-8">
              <LoadingState variant="detail" />
            </div>
          ) : isError || !company ? (
            <div className="p-8">
              <ErrorState
                title="Failed to load company"
                description="Could not load company details. Please try again."
                onRetry={() => {
                  refetch();
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header with generous right padding to prevent X overlap */}
              <SheetHeader className="p-6 pr-14 border-b border-[var(--border-default)] bg-[var(--surface-primary)]">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-[10px] bg-[var(--primary)] text-white flex items-center justify-center text-[18px] font-bold shadow-xs shrink-0">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-[20px] font-bold text-[var(--text-primary)] leading-tight truncate">
                      {company.name}
                    </SheetTitle>
                    <SheetDescription className="text-[13px] text-[var(--text-tertiary)] flex items-center gap-2 mt-1.5">
                      <span>{company.industry}</span>
                      <span>•</span>
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-semibold ${getTierBadgeStyle(company.tier)}`}
                      >
                        {company.tier}
                      </Badge>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Key Account Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[8px] bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-[12px] font-medium">
                      <Users className="h-4 w-4" />
                      <span>Total Contacts</span>
                    </div>
                    <p className="text-[22px] font-bold text-[var(--text-primary)] mt-1">
                      {company.totalContacts}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                    <div className="flex items-center gap-2 text-[var(--badge-success-text)] text-[12px] font-medium">
                      <span className="h-2 w-2 rounded-full bg-[var(--badge-success-text)]" />
                      <span>Active</span>
                    </div>
                    <p className="text-[22px] font-bold text-[var(--text-primary)] mt-1">
                      {company.activeContacts}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[var(--surface-secondary)] border border-[var(--border-default)]">
                    <div className="flex items-center gap-2 text-[var(--risk-high-text)] text-[12px] font-medium">
                      <span className="h-2 w-2 rounded-full bg-[var(--risk-high-dot)]" />
                      <span>High Risk</span>
                    </div>
                    <p className="text-[22px] font-bold text-[var(--text-primary)] mt-1">
                      {company.highRiskContacts}
                    </p>
                  </div>
                </div>

                {/* Company Metadata Info */}
                <div className="p-4 rounded-[8px] bg-[var(--surface-primary)] border border-[var(--border-default)] space-y-3">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.03em] text-[var(--text-quaternary)]">
                    Company Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                    {company.website && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Globe className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--primary)] hover:underline flex items-center gap-1 truncate"
                        >
                          <span>{company.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}

                    {company.location && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <MapPin className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                        <span>{company.location}</span>
                      </div>
                    )}
                  </div>

                  {company.description && (
                    <div className="pt-2 border-t border-[var(--border-default)]">
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {company.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Linked Contacts Roster */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[var(--primary)]" />
                      <h4 className="text-[14px] font-bold text-[var(--text-primary)]">
                        Linked Contacts ({company.contacts?.length || 0})
                      </h4>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContactIdToLink('');
                        setAddContactMode('select');
                        setIsAddContactModalOpen(true);
                      }}
                      className="text-[12px] h-8 gap-1.5 border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
                    >
                      <Plus className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <span>Add Contact</span>
                    </Button>
                  </div>

                  {company.contacts && company.contacts.length > 0 ? (
                    <div className="space-y-2">
                      {company.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-3.5 rounded-[8px] bg-[var(--surface-primary)] border border-[var(--border-default)] hover:border-[var(--primary)]/40 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 border border-[var(--border-default)]">
                              <AvatarFallback className="bg-[var(--surface-tertiary)] text-[var(--text-primary)] text-[12px] font-semibold">
                                {contact.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                                {contact.name}
                              </p>
                              <div className="flex items-center gap-3 text-[12px] text-[var(--text-tertiary)] mt-0.5">
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span>{contact.email}</span>
                                </span>
                                <span className="hidden sm:flex items-center gap-1 shrink-0">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  <span>{contact.phone}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <StatusBadge status={contact.status} />
                            <FollowUpRiskBadge risk={getFollowUpRisk(contact.lastContactDate)} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingCustomerId(contact.id)}
                              className="h-8 w-8 p-0 text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--surface-tertiary)]"
                              title="View Customer Details"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-[8px] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)]">
                      <Users className="h-8 w-8 mx-auto text-[var(--text-quaternary)] mb-2" />
                      <p className="text-[14px] font-semibold text-[var(--text-secondary)]">
                        No contacts associated with {company.name} yet
                      </p>
                      <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                        Select an existing contact or create a new one to link.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedContactIdToLink('');
                          setAddContactMode('select');
                          setIsAddContactModalOpen(true);
                        }}
                        className="mt-3.5 bg-[var(--primary)] text-white text-[12px] gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add First Contact</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border-default)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleting(true)}
                      className="text-[13px] text-[var(--destructive)] border-[var(--accent-red-border)] hover:bg-[var(--accent-red-bg)] gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Company</span>
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(company.id)}
                      className="text-[13px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </Button>
                  )}
                </div>

                <Link href={`/customers?company=${encodeURIComponent(company.name)}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[13px] text-[var(--primary)] hover:bg-[var(--accent)] gap-1.5"
                  >
                    <span>Filter Directory</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Contact Modal with Select from Dropdown & Create New options */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-bold text-[var(--text-primary)]">
              Add Contact to {company?.name}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--text-tertiary)]">
              Select an existing contact from your directory or create a new contact record.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-default)] gap-1">
            <Button
              type="button"
              variant={addContactMode === 'select' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setAddContactMode('select')}
              className={`flex-1 text-[13px] font-semibold gap-1.5 h-8 ${
                addContactMode === 'select'
                  ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Select Existing Contact</span>
            </Button>
            <Button
              type="button"
              variant={addContactMode === 'create' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setAddContactMode('create')}
              className={`flex-1 text-[13px] font-semibold gap-1.5 h-8 ${
                addContactMode === 'create'
                  ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create New Contact</span>
            </Button>
          </div>

          <div className="pt-2">
            {addContactMode === 'select' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[var(--text-primary)]">
                    Choose Contact from Directory
                  </label>
                  <Select
                    value={selectedContactIdToLink}
                    onValueChange={setSelectedContactIdToLink}
                    disabled={isLoadingAllCustomers}
                  >
                    <SelectTrigger className="h-10 text-[13px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)]">
                      <SelectValue
                        placeholder={
                          isLoadingAllCustomers
                            ? 'Loading contacts...'
                            : 'Select a contact to link...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableToLink.length === 0 ? (
                        <div className="p-3 text-[13px] text-center text-[var(--text-tertiary)]">
                          All available contacts are already linked to this company.
                        </div>
                      ) : (
                        availableToLink.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="font-medium text-[var(--text-primary)]">
                                {contact.name}
                              </span>
                              <span className="text-[12px] text-[var(--text-tertiary)] truncate max-w-[200px]">
                                {contact.company ? `${contact.company} • ` : ''}
                                {contact.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Contact Preview Card */}
                {selectedContactToLink && (
                  <div className="p-3.5 rounded-[8px] bg-[var(--surface-secondary)] border border-[var(--border-default)] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-bold text-[var(--text-primary)]">
                        {selectedContactToLink.name}
                      </p>
                      <StatusBadge status={selectedContactToLink.status} />
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)] space-y-0.5">
                      <p>{selectedContactToLink.email}</p>
                      <p>
                        Current Company: <span className="font-semibold">{selectedContactToLink.company || 'None'}</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-[var(--primary)] font-medium pt-1 border-t border-[var(--border-default)] flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Will be updated and assigned to {company?.name}</span>
                    </p>
                  </div>
                )}

                {/* Footer action buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-default)]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddContactModalOpen(false)}
                    disabled={updateCustomerMutation.isPending}
                    className="text-[13px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedContactIdToLink || updateCustomerMutation.isPending}
                    onClick={handleLinkExistingContact}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-semibold gap-1.5"
                  >
                    {updateCustomerMutation.isPending ? 'Linking...' : 'Link Contact'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Create New Contact Form */
              company && (
                <CustomerForm
                  mode="create"
                  defaultValues={{ company: company.name }}
                  onSubmit={handleCreateContactSubmit}
                  onCancel={() => setIsAddContactModalOpen(false)}
                  isSubmitting={createCustomerMutation.isPending}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Drawer */}
      <CustomerDrawer
        customerId={viewingCustomerId}
        isOpen={Boolean(viewingCustomerId)}
        onClose={() => setViewingCustomerId(null)}
      />

      {/* Delete Confirmation */}
      {company && (
        <ConfirmDialog
          isOpen={isDeleting}
          onOpenChange={setIsDeleting}
          title="Delete Company Account"
          description={`Are you sure you want to delete "${company.name}"? Linked contacts will retain their records but company associations will be cleared.`}
          confirmLabel="Delete Company"
          variant="destructive"
          onConfirm={() => {
            if (onDelete) {
              onDelete(company.id);
              setIsDeleting(false);
              onClose();
            }
          }}
        />
      )}
    </>
  );
}
