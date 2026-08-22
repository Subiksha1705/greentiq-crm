'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { getQueryClient } from '@/lib/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient singleton per client render boundary
  const [queryClient] = useState(() => getQueryClient());
  const { theme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors theme={theme as 'light' | 'dark' | 'system'} />
    </QueryClientProvider>
  );
}
