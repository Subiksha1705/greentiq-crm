'use client';

import { useQuery } from '@tanstack/react-query';
import { getCompany } from '@/lib/api/companies';
import { companyKeys } from '@/lib/query-keys';
import { CompanyWithStats } from '@/types/company';

export function useCompany(id: string | null) {
  return useQuery<CompanyWithStats | null>({
    queryKey: id ? companyKeys.detail(id) : ['companies', 'detail', 'null'],
    queryFn: () => (id ? getCompany(id) : null),
    enabled: Boolean(id),
  });
}
