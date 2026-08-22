'use client';

import React from 'react';
import { Customer, CustomerSortState } from '@/types/customer';
import {
  Table,
  TableBody,
  TableCell,
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
      <TableHead className={className}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(columnKey)}
          className={cn(
            '-ml-3 h-8 text-xs font-semibold hover:bg-muted/80 data-[state=open]:bg-accent',
            isActive ? 'text-primary font-bold' : 'text-muted-foreground'
          )}
        >
          <span>{label}</span>
          {isActive ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
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
      <div className="w-full border rounded-xl p-12 text-center bg-card shadow-xs flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No customers found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          No customer records match your current search or active filter combination.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-2">
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border rounded-xl overflow-hidden bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-muted/40">
            {renderSortHeader('Name', 'name', 'w-[200px]')}
            {renderSortHeader('Email', 'email', 'w-[220px]')}
            <TableHead className="w-[140px] text-xs font-semibold text-muted-foreground">Phone</TableHead>
            <TableHead className="w-[160px] text-xs font-semibold text-muted-foreground">Company</TableHead>
            <TableHead className="w-[100px] text-xs font-semibold text-muted-foreground">Status</TableHead>
            {renderSortHeader('Last Contact', 'lastContactDate', 'w-[140px]')}
            {renderSortHeader('Follow-up Risk', 'followUpRisk', 'w-[140px]')}
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
