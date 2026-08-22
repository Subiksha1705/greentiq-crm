'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCompany } from '@/lib/api/companies';
import { companyKeys, customerKeys } from '@/lib/query-keys';
import { CreateCompanyInput, CompanyWithStats } from '@/types/company';

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyWithStats, Error, CreateCompanyInput>({
    mutationFn: (input: CreateCompanyInput) => createCompany(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });
    },
  });
}
