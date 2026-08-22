import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        destructive:
          'border-transparent bg-rose-500 text-slate-50 dark:bg-rose-900 dark:text-slate-50',
        outline: 'text-slate-950 dark:text-slate-50',
        success:
          'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
        warning:
          'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
        danger:
          'border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
