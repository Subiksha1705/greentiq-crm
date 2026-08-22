import React from 'react';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            High-level customer portfolio metrics and attention alerts
          </p>
        </div>

        <Link
          href="/customers"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Dashboard KPIs & Attention Alerts (Phase 9)
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Phase 1 Foundation complete. Sourced from mock service statistics once Phase 2 & Phase 9 are reached.
        </p>
      </div>
    </div>
  );
}
