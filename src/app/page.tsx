import React from 'react';
import { LayoutDashboard, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome to the Greentiq CRM overview.
          </p>
        </div>
      </div>

      {/* Empty State / Placeholder for Dashboard Widgets */}
      <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Dashboard coming soon
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          This is a placeholder for the future Dashboard page. 
          Use the sidebar to navigate to the Customers view.
        </p>
      </div>
    </div>
  );
}
