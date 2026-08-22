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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  defaultWidth?: number;
}

function ResizableHeader({ children, className, defaultWidth = 150, ...props }: ResizableHeaderProps) {
  const [width, setWidth] = React.useState(defaultWidth);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      setWidth(Math.max(60, startWidth + moveEvent.clientX - startX));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <TableHead 
      className={cn('relative px-4 py-2.5 h-auto text-[14px] font-semibold group', className)}
      style={{ width, minWidth: width, maxWidth: width }}
      {...props}
    >
      <div className="flex items-center justify-between w-full h-full overflow-hidden">
        {children}
      </div>
      {/* Resizer Handle */}
      <div 
        onMouseDown={startDrag}
        className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize flex items-center justify-center group/resizer"
        title="Drag to resize column"
      >
        <div className="w-[3px] h-6 bg-[var(--border-default)] group-hover/resizer:bg-emerald-500 rounded-full transition-colors" />
      </div>
    </TableHead>
  );
}

interface CustomerTableProps {
  customers: Customer[];
  sortBy?: CustomerSortState['sortBy'];
  sortOrder?: CustomerSortState['sortOrder'];
  onSortChange: (column: NonNullable<CustomerSortState['sortBy']>) => void;
  onSelectCustomer?: (id: string) => void;
  onClearFilters?: () => void;
  selectedCustomerIds?: string[];
  onToggleSelectCustomer?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export function CustomerTable({
  customers,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectCustomer,
  onClearFilters,
  selectedCustomerIds = [],
  onToggleSelectCustomer,
  onToggleSelectAll,
}: CustomerTableProps) {
  const allCurrentPageSelected =
    customers.length > 0 && customers.every((c) => selectedCustomerIds.includes(c.id));
  const someCurrentPageSelected =
    customers.some((c) => selectedCustomerIds.includes(c.id)) && !allCurrentPageSelected;

  const renderSortHeader = (
    label: string,
    columnKey: NonNullable<CustomerSortState['sortBy']>,
    className?: string
  ) => {
    const isActive = sortBy === columnKey;
    return (
      <ResizableHeader className={cn('text-[var(--text-primary)]', className)} defaultWidth={parseInt(className?.match(/w-\[(\d+)px\]/)?.[1] || '150')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(columnKey)}
          className={cn(
            '-ml-3 h-8 text-[14px] font-semibold hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
            isActive ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)]'
          )}
        >
          <span>{label}</span>
          {isActive ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-[var(--primary)]" />
            ) : (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-[var(--primary)]" />
            )
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          )}
        </Button>
      </ResizableHeader>
    );
  };

  if (customers.length === 0) {
    return (
      <div className="w-full border border-[var(--border-default)] rounded-[12px] p-12 text-center bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[var(--surface-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] mb-1">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">No customers found</h3>
        <p className="text-[14px] text-[var(--text-tertiary)] max-w-sm">
          No customer records match your current search or active filter combination.
        </p>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-2 text-[14px] font-medium border-[var(--border-default)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-[6px]"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border border-[var(--border-default)] rounded-[8px] overflow-x-auto bg-[var(--card)] shadow-xs">
      <Table className="w-full text-left text-[14px] min-w-[850px]">
        <TableHeader className="bg-[var(--surface-secondary)]">
          <TableRow className="hover:bg-[var(--surface-secondary)] border-b border-[var(--border-default)]">
            {/* Header Select All Checkbox */}
            <TableHead className="w-[44px] px-3 py-2.5 text-center">
              <Checkbox
                checked={allCurrentPageSelected ? true : someCurrentPageSelected ? 'indeterminate' : false}
                onCheckedChange={() => onToggleSelectAll?.()}
                aria-label="Select all customers on page"
                className="border-[var(--border-strong)] data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
              />
            </TableHead>
            {renderSortHeader('Name', 'name', 'w-[220px]')}
            {renderSortHeader('Email', 'email', 'w-[220px]')}
            <ResizableHeader className="text-[var(--text-secondary)]" defaultWidth={140}>Phone</ResizableHeader>
            <ResizableHeader className="text-[var(--text-secondary)]" defaultWidth={160}>Company</ResizableHeader>
            <ResizableHeader className="text-[var(--text-secondary)]" defaultWidth={110}>Status</ResizableHeader>
            {renderSortHeader('Last Contact', 'lastContactDate', 'w-[150px]')}
            {renderSortHeader('Follow-up Risk', 'followUpRisk', 'w-[150px]')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomerIds.includes(customer.id)}
              isRowChecked={selectedCustomerIds.includes(customer.id)}
              onToggleCheck={onToggleSelectCustomer}
              onSelectCustomer={onSelectCustomer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
