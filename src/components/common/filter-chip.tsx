'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  category?: string;
  onRemove: () => void;
  className?: string;
}

export function FilterChip({
  label,
  category,
  onRemove,
  className,
}: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border bg-muted/60 hover:bg-muted text-foreground transition-colors group',
        className
      )}
    >
      {category && (
        <span className="text-muted-foreground font-normal">{category}:</span>
      )}
      <span>{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-full p-0.5 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
