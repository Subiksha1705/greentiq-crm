'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomerStats } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { CustomerStats } from '@/types/customer';

export function useCustomerStats() {
  return useQuery<CustomerStats>({
    queryKey: customerKeys.stats(),
    queryFn: () => getCustomerStats(),
  });
}
