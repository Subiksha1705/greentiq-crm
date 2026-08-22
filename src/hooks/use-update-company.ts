'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompany } from '@/lib/api/companies';
import { companyKeys, customerKeys } from '@/lib/query-keys';
import { UpdateCompanyInput, CompanyWithStats } from '@/types/company';

interface UpdateCompanyArgs {
  id: string;
  input: UpdateCompanyInput;
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyWithStats, Error, UpdateCompanyArgs>({
    mutationFn: ({ id, input }: UpdateCompanyArgs) => updateCompany(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
