import React, { Suspense } from 'react';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { LoadingState } from '@/components/common/loading-state';

export const metadata = {
  title: 'Dashboard — Greentiq CRM',
  description: 'Executive overview, relationship metrics, and Follow-up Risk assessment.',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState variant="card" count={4} />}>
      <DashboardView />
    </Suspense>
  );
}
