'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useCustomer } from '@/hooks/use-customer';
import { useUpdateCustomer } from '@/hooks/use-update-customer';
import { StatusBadge } from '@/components/common/status-badge';
import { FollowUpRiskBadge } from './follow-up-risk-badge';
import { getFollowUpRisk } from '@/lib/customer-rules';
import { getCalendarDaysDifference } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Mail,
  Phone,
  Building2,
  Clock,
  MessageSquare,
  PhoneCall,
  Users,
  FileText,
  AlertCircle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Interaction, InteractionType } from '@/types/customer';

interface CustomerDetailsProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customerId: string) => void;
  onDelete?: (customerId: string) => void;
}

export function CustomerDetails({
  customerId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailsProps) {
  const { data: customer, isLoading, isError, error } = useCustomer(customerId);
  const updateCustomerMutation = useUpdateCustomer();

  // Selected date in the "Update Last Contact" date picker. Defaults to today.
  const [selectedContactDate, setSelectedContactDate] = useState<Date>(new Date());

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');

  // Interaction Modal state (Add / Edit)
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionType>('call');
  const [interactionDate, setInteractionDate] = useState<Date>(new Date());
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionError, setInteractionError] = useState('');

  // Reset states when a new customer opens
  useEffect(() => {
    if (isOpen && customer) {
      setSelectedContactDate(new Date());
      setIsEditingNotes(false);
      setDraftNotes(customer.notes || '');
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  // 1. Update Last Contact flow
  const handleUpdateLastContact = async () => {
    if (!customerId || !selectedContactDate) return;
    const formattedDate = format(selectedContactDate, 'yyyy-MM-dd');

    await updateCustomerMutation.mutateAsync({
      id: customerId,
      input: {
        lastContactDate: formattedDate,
      },
    });
  };

  // 2. Save Notes flow
  const handleSaveNotes = async () => {
    if (!customerId) return;
    await updateCustomerMutation.mutateAsync({
      id: customerId,
      input: {
        notes: draftNotes.trim(),
      },
    });
    setIsEditingNotes(false);
  };

  const handleClearNotes = async () => {
    if (!customerId) return;
    await updateCustomerMutation.mutateAsync({
      id: customerId,
      input: {
        notes: '',
      },
    });
    setDraftNotes('');
    setIsEditingNotes(false);
  };

  // 3. Interaction CRUD Handlers
  const handleOpenAddInteraction = () => {
    setEditingInteractionId(null);
    setInteractionType('call');
    setInteractionDate(new Date());
    setInteractionSummary('');
    setInteractionError('');
    setInteractionModalOpen(true);
  };

  const handleOpenEditInteraction = (interaction: Interaction) => {
    setEditingInteractionId(interaction.id);
    setInteractionType(interaction.type);
    try {
      setInteractionDate(new Date(`${interaction.date}T00:00:00`));
    } catch {
      setInteractionDate(new Date());
    }
    setInteractionSummary(interaction.summary);
    setInteractionError('');
    setInteractionModalOpen(true);
  };

  const handleSaveInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !customer) return;

    if (!interactionSummary.trim()) {
      setInteractionError('Summary is required');
      return;
    }

    const formattedDate = format(interactionDate, 'yyyy-MM-dd');
    let nextInteractions = [...(customer.interactions || [])];

    if (editingInteractionId) {
      // Edit existing
      nextInteractions = nextInteractions.map((item) =>
        item.id === editingInteractionId
          ? {
              ...item,
              type: interactionType,
              date: formattedDate,
              summary: interactionSummary.trim(),
            }
          : item
      );
    } else {
      // Add new
      const newInteraction: Interaction = {
        id: `int-${Date.now()}`,
        type: interactionType,
        date: formattedDate,
        summary: interactionSummary.trim(),
      };
      nextInteractions.unshift(newInteraction);
    }

    await updateCustomerMutation.mutateAsync({
      id: customerId,
      input: {
        interactions: nextInteractions,
      },
    });

    setInteractionModalOpen(false);
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!customerId || !customer) return;
    const nextInteractions = (customer.interactions || []).filter((item) => item.id !== interactionId);

    await updateCustomerMutation.mutateAsync({
      id: customerId,
      input: {
        interactions: nextInteractions,
      },
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-3.5 w-3.5 text-[var(--primary)]" />;
      case 'email':
        return <Mail className="h-3.5 w-3.5 text-[var(--badge-info-text)]" />;
      case 'meeting':
        return <Users className="h-3.5 w-3.5 text-[#A855F7]" />;
      case 'note':
      default:
        return <FileText className="h-3.5 w-3.5 text-[var(--risk-medium-text)]" />;
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl flex flex-col h-full bg-[var(--card)] text-[var(--foreground)] p-0 overflow-hidden shadow-2xl border-l border-[var(--border-default)]"
        >
          {isLoading ? (
            <div className="p-6">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-[18px] font-semibold text-[var(--text-primary)]">
                  Customer Details
                </SheetTitle>
                <SheetDescription className="text-[13px] text-[var(--text-tertiary)]">
                  Loading customer information...
                </SheetDescription>
              </SheetHeader>
              <LoadingState variant="detail" />
            </div>
          ) : isError || !customer ? (
            <div className="p-8 my-auto">
              <ErrorState
                variant="card"
                title="Something went wrong"
                description="We were unable to load the customer information. Please try closing the drawer and reopening it."
                onRetry={onClose}
              />
            </div>
          ) : (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-[var(--border-default)] shadow-xs">
                      <AvatarFallback className="bg-[var(--primary)] text-white font-bold text-[18px]">
                        {customer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-[20px] font-bold text-[var(--text-primary)] leading-tight">
                        {customer.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[14px] text-[var(--text-secondary)] font-medium flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-[var(--text-quaternary)]" />
                          {customer.company}
                        </span>
                        <span className="text-[var(--border-strong)]">•</span>
                        <StatusBadge status={customer.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Risk & Last Contact Hero Card */}
                {(() => {
                  const derivedRisk = getFollowUpRisk(customer.lastContactDate);
                  const daysDiff = getCalendarDaysDifference(customer.lastContactDate);
                  const formattedDate = (() => {
                    try {
                      return format(parseISO(customer.lastContactDate), 'MMM d, yyyy');
                    } catch {
                      return customer.lastContactDate;
                    }
                  })();

                  return (
                    <div className="p-4 rounded-[10px] border border-[var(--border-default)] bg-[var(--card)] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--text-tertiary)]" />
                          <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
                            Follow-up Risk Assessment
                          </span>
                        </div>
                        <FollowUpRiskBadge risk={derivedRisk} />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
                        <div>
                          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Last Contacted</span>
                          <p className="text-[14px] font-semibold text-[var(--text-primary)] mt-0.5">
                            {formattedDate}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Recency</span>
                          <p className="text-[14px] font-semibold text-[var(--text-primary)] mt-0.5">
                            {daysDiff === 0 ? 'Today' : daysDiff === 1 ? '1 day ago' : `${daysDiff} days ago`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Update Last Contact Section */}
                <div className="p-5 rounded-[10px] border border-[var(--accent-green-border)] bg-[var(--accent-green-bg)] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--risk-low-text)]">
                        Update Last Contact
                      </h3>
                      <p className="text-[12px] text-[var(--risk-low-text)] opacity-80">
                        Defaults to today. Future dates are disabled.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                    <div className="flex-1">
                       <DatePicker
                        date={selectedContactDate}
                        onSelect={(d) => d && setSelectedContactDate(d)}
                        toDate={new Date()}
                        disabled={(d) => d > new Date()}
                        className="bg-[var(--card)] text-[var(--text-primary)] border-[var(--border-default)] text-[14px] h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleUpdateLastContact}
                      disabled={updateCustomerMutation.isPending}
                      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-[14px] h-9 px-4 shrink-0 shadow-xs"
                    >
                      {updateCustomerMutation.isPending ? (
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Contact Information (Fully displayed, clickable mailto & tel) */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email Block */}
                    <div className="p-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] space-y-1">
                      <div className="flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </div>
                        <a
                          href={`mailto:${customer.email}`}
                          className="text-[var(--primary)] hover:text-[var(--primary-hover)] inline-flex items-center gap-0.5 text-[11px] font-medium"
                          title="Open in mail client"
                        >
                          <span>Email</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-[13px] font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:underline break-all font-mono block transition-colors"
                      >
                        {customer.email}
                      </a>
                    </div>

                    {/* Phone Block */}
                    <div className="p-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] space-y-1">
                      <div className="flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <span>Phone</span>
                        </div>
                        <a
                          href={`tel:${customer.phone}`}
                          className="text-[var(--primary)] hover:text-[var(--primary-hover)] inline-flex items-center gap-0.5 text-[11px] font-medium"
                          title="Call phone number"
                        >
                          <span>Call</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-[13px] font-medium text-[var(--text-primary)] hover:text-[var(--primary)] hover:underline break-all font-mono block transition-colors"
                      >
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Notes (CRUD enabled) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
                      Notes
                    </h4>
                    {!isEditingNotes ? (
                      <div className="flex items-center gap-2">
                        {customer.notes && (
                          <button
                            type="button"
                            onClick={handleClearNotes}
                            disabled={updateCustomerMutation.isPending}
                            className="text-[11px] text-[var(--destructive)] hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Clear</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setDraftNotes(customer.notes || '');
                            setIsEditingNotes(true);
                          }}
                          className="text-[11px] text-[var(--primary)] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>{customer.notes ? 'Edit' : 'Add Note'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingNotes(false)}
                          className="text-[11px] text-[var(--text-tertiary)] hover:underline inline-flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          disabled={updateCustomerMutation.isPending}
                          className="text-[11px] text-[var(--primary)] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder="Add customer notes, preferences, or account context..."
                        className="text-[13px] bg-[var(--card)] text-[var(--text-primary)] border-[var(--border-default)] min-h-[90px]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingNotes(false)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          disabled={updateCustomerMutation.isPending}
                          className="h-8 text-xs bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  ) : customer.notes ? (
                    <div className="p-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                      {customer.notes}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setDraftNotes('');
                        setIsEditingNotes(true);
                      }}
                      className="p-3.5 rounded-[8px] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] text-[13px] text-[var(--text-quaternary)] cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Click to add customer notes</span>
                    </div>
                  )}
                </div>

                {/* Interaction History (CRUD enabled) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-tertiary)]">
                      Interaction History ({customer.interactions?.length || 0})
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddInteraction}
                      className="h-7 text-xs border-[var(--border-default)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--risk-low-text)] gap-1 px-2.5 font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Log Interaction</span>
                    </Button>
                  </div>

                  {!customer.interactions || customer.interactions.length === 0 ? (
                    <div
                      onClick={handleOpenAddInteraction}
                      className="p-6 border border-dashed border-[var(--border-default)] rounded-[8px] text-center text-[13px] text-[var(--text-quaternary)] cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors space-y-1"
                    >
                      <MessageSquare className="h-6 w-6 mx-auto text-[var(--text-quaternary)]" />
                      <p className="font-medium">No interaction logs yet</p>
                      <p className="text-[12px] text-[var(--text-tertiary)]">Click to record a call, email, or meeting</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {[...customer.interactions]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((interaction) => {
                          const formattedDate = (() => {
                            try {
                              return format(parseISO(interaction.date), 'MMM d, yyyy');
                            } catch {
                              return interaction.date;
                            }
                          })();

                          return (
                            <div
                              key={interaction.id}
                              className="p-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--card)] shadow-2xs space-y-1.5 group hover:border-[var(--text-tertiary)] transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-[var(--surface-tertiary)]">
                                    {getInteractionIcon(interaction.type)}
                                  </div>
                                  <span className="text-[12px] font-semibold uppercase text-[var(--text-secondary)]">
                                    {interaction.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[var(--text-tertiary)]">
                                    {formattedDate}
                                  </span>
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditInteraction(interaction)}
                                      className="p-1 text-[var(--text-tertiary)] hover:text-[var(--primary)] rounded hover:bg-[var(--surface-tertiary)]"
                                      title="Edit interaction"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteInteraction(interaction.id)}
                                      className="p-1 text-[var(--text-tertiary)] hover:text-[var(--destructive)] rounded hover:bg-[var(--accent-red-bg)]"
                                      title="Delete interaction"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[13px] text-[var(--text-secondary)] pl-7 leading-relaxed">
                                {interaction.summary}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-[var(--border-default)] bg-[var(--surface-secondary)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(customer.id)}
                      className="text-[13px] text-[var(--destructive)] border-[var(--accent-red-border)] hover:bg-[var(--accent-red-bg)] hover:brightness-105 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(customer.id)}
                      className="text-[13px] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-secondary)] gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <span>Edit Customer</span>
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-[13px] text-[var(--text-secondary)] border-[var(--border-default)]"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add / Edit Interaction Modal */}
      <Dialog open={interactionModalOpen} onOpenChange={setInteractionModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSaveInteraction}>
            <DialogHeader>
              <DialogTitle>
                {editingInteractionId ? 'Edit Interaction' : 'Log New Interaction'}
              </DialogTitle>
              <DialogDescription>
                Record touchpoints and client meetings to keep account history up-to-date.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Interaction Type
                  </label>
                  <Select
                    value={interactionType}
                    onValueChange={(val) => setInteractionType(val as InteractionType)}
                  >
                    <SelectTrigger className="h-9 text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Date
                  </label>
                  <DatePicker
                    date={interactionDate}
                    onSelect={(d) => d && setInteractionDate(d)}
                    toDate={new Date()}
                    disabled={(d) => d > new Date()}
                    className="h-9 text-[14px]"
                  />
                </div>
              </div>

              {/* Summary Textarea */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Summary / Notes
                </label>
                <Textarea
                  value={interactionSummary}
                  onChange={(e) => {
                    setInteractionSummary(e.target.value);
                    setInteractionError('');
                  }}
                  placeholder="E.g., Discussed quarterly contract renewal and upcoming expansion."
                  className="text-[13px] min-h-[90px]"
                />
                {interactionError && (
                  <p className="text-[12px] text-[var(--destructive)]">{interactionError}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInteractionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCustomerMutation.isPending}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
              >
                {updateCustomerMutation.isPending ? 'Saving...' : 'Save Interaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
