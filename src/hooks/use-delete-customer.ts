'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCustomer } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (_, id) => {
      // Invalidate list variants, dashboard stats, filter options, and remove customer detail query
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer');
    },
  });
}
