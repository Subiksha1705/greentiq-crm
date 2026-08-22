'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: 'page' | 'card' | 'inline';
  className?: string;
  showHomeLink?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  variant = 'page',
  className,
  showHomeLink = false,
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg border border-[var(--accent-red-border)] bg-[var(--accent-red-bg)] text-[var(--risk-high-text)] text-sm',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />
          <span>{description}</span>
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs text-[var(--risk-high-text)] hover:bg-[var(--accent-red-border)] gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'w-full p-8 border border-[var(--accent-red-border)] rounded-xl bg-[var(--accent-red-bg)] text-center flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="h-10 w-10 rounded-full bg-[var(--risk-high-bg)] flex items-center justify-center text-[var(--destructive)]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h4>
          <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">{description}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-1 border-[var(--border-default)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    );
  }

  // variant === 'page'
  return (
    <div
      className={cn(
        'w-full min-h-[400px] border border-[var(--border-default)] rounded-2xl bg-[var(--card)] p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs',
        className
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-[var(--accent-red-bg)] border border-[var(--accent-red-border)] flex items-center justify-center text-[var(--destructive)] shadow-xs">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
        <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-[14px] gap-2 px-5 shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}

        {showHomeLink && (
          <Button
            asChild
            variant="outline"
            className="border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] text-[14px]"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
