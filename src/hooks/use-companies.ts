'use client';

import { useQuery } from '@tanstack/react-query';
import { listCompanies } from '@/lib/api/companies';
import { companyKeys } from '@/lib/query-keys';
import { CompanyListParams, PaginatedCompanyResult } from '@/types/company';

export function useCompanies(params?: CompanyListParams) {
  return useQuery<PaginatedCompanyResult>({
    queryKey: companyKeys.list(params),
    queryFn: () => listCompanies(params),
  });
}
