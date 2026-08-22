'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomersByIds } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { Customer } from '@/types/customer';

export function useCustomersByIds(ids: string[], enabled: boolean = true) {
  return useQuery<Customer[]>({
    queryKey: customerKeys.byIds(ids),
    queryFn: () => getCustomersByIds(ids),
    enabled: enabled && ids.length > 0,
  });
}
