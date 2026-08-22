'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/common/error-state';

export default function CustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Customers Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="Failed to load Customer Workspace"
        description="We ran into an issue loading the customer directory. Please retry or contact support if the problem persists."
        onRetry={reset}
        showHomeLink
      />
    </div>
  );
}
