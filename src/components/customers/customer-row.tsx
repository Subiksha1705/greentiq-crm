'use client';

import React from 'react';
import { Customer } from '@/types/customer';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/common/status-badge';
import { FollowUpRiskBadge } from './follow-up-risk-badge';
import { getFollowUpRisk } from '@/lib/customer-rules';
import { getCalendarDaysDifference } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface CustomerRowProps {
  customer: Customer;
  isSelected?: boolean;
  isRowChecked?: boolean;
  onToggleCheck?: (id: string) => void;
  onSelectCustomer?: (id: string) => void;
}

export function CustomerRow({
  customer,
  isSelected = false,
  isRowChecked = false,
  onToggleCheck,
  onSelectCustomer,
}: CustomerRowProps) {
  const derivedRisk = getFollowUpRisk(customer.lastContactDate);
  const daysDiff = getCalendarDaysDifference(customer.lastContactDate);

  const formatLastContact = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      const formatted = format(parsed, 'MMM d, yyyy');
      let relative = '';
      if (daysDiff === 0) {
        relative = 'Today';
      } else if (daysDiff === 1) {
        relative = '1 day ago';
      } else {
        relative = `${daysDiff} days ago`;
      }
      return { formatted, relative };
    } catch {
      return { formatted: dateStr, relative: '' };
    }
  };

  const { formatted: dateFormatted, relative: dateRelative } = formatLastContact(customer.lastContactDate);

  return (
    <TableRow
      onClick={() => onSelectCustomer?.(customer.id)}
      className={`cursor-pointer group border-b border-[var(--border-subtle)] transition-colors ${
        isRowChecked
          ? 'bg-[var(--accent)]'
          : isSelected
          ? 'bg-[var(--accent)] border-l-2 border-l-[var(--primary)]'
          : 'bg-[var(--card)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      {/* Checkbox Column */}
      <TableCell className="w-[44px] px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isRowChecked}
          onCheckedChange={() => onToggleCheck?.(customer.id)}
          aria-label={`Select ${customer.name}`}
          className="border-[var(--border-strong)] data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
        />
      </TableCell>

      {/* Name */}
      <TableCell className="px-4 py-3 text-[14px] font-medium text-[var(--text-primary)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--surface-tertiary)] text-[var(--text-secondary)] font-semibold flex items-center justify-center text-[12px] shrink-0 border border-[var(--border-default)]">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <span className="group-hover:text-[var(--primary)] transition-colors font-semibold text-[14px]">
            {customer.name}
          </span>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell className="px-4 py-3 text-[14px] font-normal text-[var(--text-secondary)] font-mono text-[13px]">
        {customer.email}
      </TableCell>

      {/* Phone */}
      <TableCell className="px-4 py-3 text-[14px] font-normal text-[var(--text-secondary)] font-mono text-[13px]">
        {customer.phone}
      </TableCell>

      {/* Company */}
      <TableCell className="px-4 py-3 text-[14px] font-medium text-[var(--text-primary)]">
        {customer.company}
      </TableCell>

      {/* Status */}
      <TableCell className="px-4 py-3">
        <StatusBadge status={customer.status} />
      </TableCell>

      {/* Last Contact */}
      <TableCell className="px-4 py-3 text-[14px]">
        <div className="flex flex-col">
          <span className="font-medium text-[var(--text-primary)] text-[13px]">{dateFormatted}</span>
          <span className="text-[12px] text-[var(--text-tertiary)] font-normal">{dateRelative}</span>
        </div>
      </TableCell>

      {/* Follow-up Risk */}
      <TableCell className="px-4 py-3">
        <FollowUpRiskBadge risk={derivedRisk} />
      </TableCell>
    </TableRow>
  );
}
