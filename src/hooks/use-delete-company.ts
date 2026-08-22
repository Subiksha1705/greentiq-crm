'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCompany } from '@/lib/api/companies';
import { companyKeys, customerKeys } from '@/lib/query-keys';

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: string }, Error, string>({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });
    },
  });
}
