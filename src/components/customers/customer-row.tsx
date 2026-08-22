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
  onSelectCustomer?: (id: string) => void;
}

export function CustomerRow({ customer, onSelectCustomer }: CustomerRowProps) {
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
      className="cursor-pointer group hover:bg-muted/50 transition-colors"
    >
      {/* Name */}
      <TableCell className="font-medium text-foreground">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <span className="group-hover:text-primary transition-colors font-medium text-sm">
            {customer.name}
          </span>
        </div>
      </TableCell>

      {/* Email */}
      <TableCell className="text-muted-foreground text-sm font-mono text-xs">
        {customer.email}
      </TableCell>

      {/* Phone */}
      <TableCell className="text-muted-foreground text-sm font-mono text-xs">
        {customer.phone}
      </TableCell>

      {/* Company */}
      <TableCell className="text-foreground text-sm font-medium">
        {customer.company}
      </TableCell>

      {/* Status */}
      <TableCell>
        <StatusBadge status={customer.status} />
      </TableCell>

      {/* Last Contact */}
      <TableCell className="text-sm">
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-xs">{dateFormatted}</span>
          <span className="text-[11px] text-muted-foreground">{dateRelative}</span>
        </div>
      </TableCell>

      {/* Follow-up Risk */}
      <TableCell>
        <FollowUpRiskBadge risk={derivedRisk} />
      </TableCell>
    </TableRow>
  );
}
