'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: id ? customerKeys.detail(id) : ['customer', 'none'],
    queryFn: () => (id ? getCustomer(id) : null),
    enabled: Boolean(id),
  });
}
