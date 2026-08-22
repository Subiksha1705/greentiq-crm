'use client';

import { useQuery } from '@tanstack/react-query';
import { listAllFilteredCustomers } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { Customer, CustomerListParams } from '@/types/customer';

export function useAllFilteredCustomers(
  params: Omit<CustomerListParams, 'page' | 'pageSize'>,
  enabled: boolean = true
) {
  return useQuery<Customer[]>({
    queryKey: customerKeys.filteredAll(params),
    queryFn: () => listAllFilteredCustomers(params),
    enabled,
  });
}
