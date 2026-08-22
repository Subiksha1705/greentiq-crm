'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomerFilterOptions } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';

export function useCustomerFilterOptions() {
  return useQuery<{ companies: string[] }>({
    queryKey: customerKeys.filterOptions(),
    queryFn: () => getCustomerFilterOptions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
