'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
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
          'flex items-center justify-between p-3 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] text-[#991B1B] text-sm',
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
            className="h-7 px-2 text-xs text-[#991B1B] hover:bg-[#FEE2E2] gap-1"
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
          'w-full p-8 border border-[#FEE2E2] rounded-xl bg-[#FEF2F2]/50 text-center flex flex-col items-center justify-center gap-3',
          className
        )}
      >
        <div className="h-10 w-10 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-[15px] font-semibold text-[#1A1D23]">{title}</h4>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">{description}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-1 border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] text-xs gap-1.5"
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
        'w-full min-h-[400px] border border-[#E5E7EB] rounded-2xl bg-white p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs',
        className
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center text-[#EF4444] shadow-xs">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h2 className="text-[20px] font-bold text-[#1A1D23] tracking-tight">{title}</h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[14px] gap-2 px-5 shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}

        {showHomeLink && (
          <Button
            asChild
            variant="outline"
            className="border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] text-[14px]"
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
