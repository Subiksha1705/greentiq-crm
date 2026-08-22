import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client Configuration.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds (data is considered fresh for 30s to avoid thrashing during UI interactions)
 * - gcTime: 5 minutes (inactive queries are garbage collected after 5m)
 * - refetchOnWindowFocus: false (prevents disruptive refetches during rapid window switching)
 * - retry: 1 (retry failed queries once before showing ErrorState UI)
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let clientQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a singleton query client
    if (!clientQueryClient) clientQueryClient = createQueryClient();
    return clientQueryClient;
  }
}
