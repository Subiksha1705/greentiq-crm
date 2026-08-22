'use client';

import React from 'react';
import { Customer, CustomerSortState } from '@/types/customer';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CustomerRow } from './customer-row';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerTableProps {
  customers: Customer[];
  sortBy?: CustomerSortState['sortBy'];
  sortOrder?: CustomerSortState['sortOrder'];
  onSortChange: (column: NonNullable<CustomerSortState['sortBy']>) => void;
  onSelectCustomer?: (id: string) => void;
  onClearFilters?: () => void;
}

export function CustomerTable({
  customers,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectCustomer,
  onClearFilters,
}: CustomerTableProps) {
  const renderSortHeader = (
    label: string,
    columnKey: NonNullable<CustomerSortState['sortBy']>,
    className?: string
  ) => {
    const isActive = sortBy === columnKey;
    return (
      <TableHead className={cn('px-4 py-2.5 h-auto text-[14px] font-semibold text-[#1A1D23]', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(columnKey)}
          className={cn(
            '-ml-3 h-8 text-[14px] font-semibold hover:bg-[#F3F4F6] text-[#374151]',
            isActive ? 'text-[#16A34A] font-bold' : 'text-[#374151]'
          )}
        >
          <span>{label}</span>
          {isActive ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-[#16A34A]" />
            ) : (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-[#16A34A]" />
            )
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          )}
        </Button>
      </TableHead>
    );
  };

  if (customers.length === 0) {
    return (
      <div className="w-full border border-[#E5E7EB] rounded-[12px] p-12 text-center bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] mb-1">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-[18px] font-semibold text-[#1A1D23]">No customers found</h3>
        <p className="text-[14px] text-[#6B7280] max-w-sm">
          No customer records match your current search or active filter combination.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-2 text-[14px] font-medium border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] rounded-[6px]"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border border-[#E5E7EB] rounded-[8px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <Table>
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="hover:bg-[#F9FAFB] border-b border-[#E5E7EB]">
            {renderSortHeader('Name', 'name', 'w-[220px]')}
            {renderSortHeader('Email', 'email', 'w-[220px]')}
            <TableHead className="px-4 py-2.5 h-auto text-[14px] font-semibold text-[#374151] w-[140px]">Phone</TableHead>
            <TableHead className="px-4 py-2.5 h-auto text-[14px] font-semibold text-[#374151] w-[160px]">Company</TableHead>
            <TableHead className="px-4 py-2.5 h-auto text-[14px] font-semibold text-[#374151] w-[110px]">Status</TableHead>
            {renderSortHeader('Last Contact', 'lastContactDate', 'w-[150px]')}
            {renderSortHeader('Follow-up Risk', 'followUpRisk', 'w-[150px]')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              onSelectCustomer={onSelectCustomer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
