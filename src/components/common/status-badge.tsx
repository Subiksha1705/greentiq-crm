import React from 'react';
import { CustomerStatus } from '@/types/customer';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isActive = status === 'active';

  const config = isActive
    ? { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' }
    : { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[4px] text-[12px] font-semibold leading-none capitalize transition-colors',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      <span
        className="h-[6px] w-[6px] rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      <span>{status}</span>
    </span>
  );
}
