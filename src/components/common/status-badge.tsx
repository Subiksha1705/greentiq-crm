import React from 'react';
import { CustomerStatus } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full capitalize text-xs transition-colors',
        isActive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
        )}
      />
      {status}
    </Badge>
  );
}
