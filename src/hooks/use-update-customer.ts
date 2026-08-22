'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCustomer } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { UpdateCustomerInput } from '@/types/customer';
import { toast } from 'sonner';

interface UpdateCustomerVariables {
  id: string;
  input: UpdateCustomerInput;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCustomerVariables) => updateCustomer(id, input),
    onSuccess: (updatedCustomer, { id }) => {
      // Invalidate list variants, specific detail query, and dashboard stats
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer');
    },
  });
}
