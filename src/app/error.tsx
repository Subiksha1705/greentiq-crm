'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/common/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log error in dev/monitoring
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <ErrorState
        title="Something went wrong"
        description="We encountered an unexpected problem while rendering this page. Our team has been notified."
        onRetry={reset}
        showHomeLink
      />
    </div>
  );
}
