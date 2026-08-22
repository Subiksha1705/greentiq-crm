'use client';

import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { CustomerListParams, PaginatedCustomerResult } from '@/types/customer';

export function useCustomers(params: CustomerListParams) {
  return useQuery<PaginatedCustomerResult>({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomers(params),
  });
}
