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
        <div className="w-[3px] h-6 bg-[#E5E7EB] group-hover/resizer:bg-emerald-500 rounded-full transition-colors" />
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
      <ResizableHeader className={cn('text-[#1A1D23]', className)} defaultWidth={parseInt(className?.match(/w-\[(\d+)px\]/)?.[1] || '150')}>
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
      </ResizableHeader>
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
    <div className="w-full border border-[#E5E7EB] rounded-[8px] overflow-x-auto bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <Table className="min-w-max">
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="hover:bg-[#F9FAFB] border-b border-[#E5E7EB]">
            {renderSortHeader('Name', 'name', 'w-[220px]')}
            {renderSortHeader('Email', 'email', 'w-[220px]')}
            <ResizableHeader className="text-[#374151]" defaultWidth={140}>Phone</ResizableHeader>
            <ResizableHeader className="text-[#374151]" defaultWidth={160}>Company</ResizableHeader>
            <ResizableHeader className="text-[#374151]" defaultWidth={110}>Status</ResizableHeader>
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
