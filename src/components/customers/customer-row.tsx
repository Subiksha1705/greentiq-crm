'use client';

import React from 'react';
import { Customer } from '@/types/customer';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/common/status-badge';
import { FollowUpRiskBadge } from './follow-up-risk-badge';
import { getFollowUpRisk } from '@/lib/customer-rules';
import { getCalendarDaysDifference } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface CustomerRowProps {
  customer: Customer;
  isSelected?: boolean;
  onSelectCustomer?: (id: string) => void;
}

export function CustomerRow({ customer, isSelected = false, onSelectCustomer }: CustomerRowProps) {
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
      className={`cursor-pointer group border-b border-[#F1F5F9] transition-colors ${
        isSelected
          ? 'bg-[#F0FDF4] border-l-2 border-l-[#16A34A]'
          : 'bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      {/* Name */}
      <TableCell className="px-4 py-3 text-[14px] font-medium text-[#1A1D23]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#F3F4F6] text-[#374151] font-semibold flex items-center justify-center text-[12px] shrink-0 border border-[#E5E7EB]">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <span className="group-hover:text-[#16A34A] transition-colors font-semibold text-[14px]">
            {customer.name}
          </span>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell className="px-4 py-3 text-[14px] font-normal text-[#4B5563] font-mono text-[13px]">
        {customer.email}
      </TableCell>

      {/* Phone */}
      <TableCell className="px-4 py-3 text-[14px] font-normal text-[#4B5563] font-mono text-[13px]">
        {customer.phone}
      </TableCell>

      {/* Company */}
      <TableCell className="px-4 py-3 text-[14px] font-medium text-[#1A1D23]">
        {customer.company}
      </TableCell>

      {/* Status */}
      <TableCell className="px-4 py-3">
        <StatusBadge status={customer.status} />
      </TableCell>

      {/* Last Contact */}
      <TableCell className="px-4 py-3 text-[14px]">
        <div className="flex flex-col">
          <span className="font-medium text-[#1A1D23] text-[13px]">{dateFormatted}</span>
          <span className="text-[12px] text-[#6B7280] font-normal">{dateRelative}</span>
        </div>
      </TableCell>

      {/* Follow-up Risk */}
      <TableCell className="px-4 py-3">
        <FollowUpRiskBadge risk={derivedRisk} />
      </TableCell>
    </TableRow>
  );
}
