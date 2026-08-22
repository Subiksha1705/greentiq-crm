import React from 'react';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Customers Workspace
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and manage your active customer relationships
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Customer Workspace Component Placeholder
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          This thin server shell will render &lt;CustomerWorkspace /&gt; starting in Phase 3.
        </p>
      </div>
    </div>
  );
}
