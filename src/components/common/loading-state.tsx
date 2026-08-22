import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant: 'table' | 'card' | 'detail';
  count?: number;
  className?: string;
}

export function LoadingState({ variant, count = 8, className }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className={cn('w-full border rounded-lg overflow-hidden bg-card shadow-xs', className)}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[200px]"><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead className="w-[220px]"><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead className="w-[140px]"><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead className="w-[160px]"><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead className="w-[100px]"><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead className="w-[140px]"><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead className="w-[120px]"><Skeleton className="h-4 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, index) => (
              <TableRow key={index} className="animate-pulse">
                <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="p-6 border rounded-xl bg-card shadow-xs space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  // variant === 'detail'
  return (
    <div className={cn('p-6 space-y-6 bg-card rounded-xl border shadow-xs', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="space-y-3 pt-4 border-t">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
