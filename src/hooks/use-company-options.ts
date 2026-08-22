'use client';

import { useQuery } from '@tanstack/react-query';
import { getCompanyOptions } from '@/lib/api/companies';
import { companyKeys } from '@/lib/query-keys';

export function useCompanyOptions() {
  return useQuery({
    queryKey: companyKeys.options(),
    queryFn: () => getCompanyOptions(),
  });
}
