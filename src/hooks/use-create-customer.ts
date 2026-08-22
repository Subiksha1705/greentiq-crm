'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { CreateCustomerInput } from '@/types/customer';
import { toast } from 'sonner';

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: (newCustomer) => {
      // Invalidate all list variants, dashboard stats, and filter options
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      queryClient.invalidateQueries({ queryKey: customerKeys.filterOptions() });
      toast.success(`Customer "${newCustomer.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer');
    },
  });
}
