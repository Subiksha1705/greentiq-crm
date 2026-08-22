import React, { Suspense } from 'react';
import { CustomerWorkspace } from '@/components/customers/customer-workspace';
import { LoadingState } from '@/components/common/loading-state';

export const metadata = {
  title: 'Customers Workspace | Greentiq CRM',
  description: 'Manage customers, follow-up risks, search, and accounts.',
};

export default function CustomersPage() {
  return (
    <Suspense fallback={<LoadingState variant="table" />}>
      <CustomerWorkspace />
    </Suspense>
  );
}
