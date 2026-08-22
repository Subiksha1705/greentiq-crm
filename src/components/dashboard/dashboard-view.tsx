'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerStats } from '@/hooks/use-customer-stats';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { DonutChart, DonutSegment } from './donut-chart';
import { BarChart, BarDataPoint } from './bar-chart';
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  ChevronRight,
  Activity,
  HeartHandshake,
  TrendingUp,
  Building2,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardView() {
  const router = useRouter();
  const { data: stats, isLoading, isError, error, refetch } = useCustomerStats();

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        <div className="space-y-2 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Executive CRM Overview
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Loading real-time account metrics and visual charts...
          </p>
        </div>
        <LoadingState variant="card" count={4} />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Failed to load dashboard metrics"
          description={
            error instanceof Error
              ? error.message
              : 'An error occurred while fetching customer metrics. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // 1. Primary KPI Cards
  const kpiCards = [
    {
      id: 'total',
      title: 'Total Customers',
      value: stats.total,
      description: 'Total accounts in database',
      icon: Users,
      href: '/customers',
      iconBg: 'bg-[var(--badge-default-bg)]',
      iconColor: 'text-[var(--badge-default-text)]',
      badge: 'All Accounts',
      badgeClass: 'bg-[var(--badge-default-bg)] text-[var(--badge-default-text)]',
      accentColor: 'border-[var(--border-default)]',
    },
    {
      id: 'active',
      title: 'Active Customers',
      value: stats.active,
      description: 'Accounts with active relationship status',
      icon: UserCheck,
      href: '/customers?status=active',
      iconBg: 'bg-[var(--risk-low-bg)]',
      iconColor: 'text-[var(--primary)]',
      badge: 'Active',
      badgeClass: 'bg-[var(--risk-low-bg)] text-[var(--risk-low-text)]',
      accentColor: 'border-[var(--border-default)]',
    },
    {
      id: 'inactive',
      title: 'Inactive Customers',
      value: stats.inactive,
      description: 'Dormant or paused customer accounts',
      icon: UserX,
      href: '/customers?status=inactive',
      iconBg: 'bg-[var(--surface-tertiary)]',
      iconColor: 'text-[var(--text-tertiary)]',
      badge: 'Inactive',
      badgeClass: 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
      accentColor: 'border-[var(--border-default)]',
    },
    {
      id: 'needs-attention',
      title: 'Needs Attention',
      value: stats.needsAttention,
      description: 'Active accounts with high follow-up risk (>30d)',
      icon: AlertTriangle,
      href: '/customers?status=active&risk=high',
      iconBg: 'bg-[var(--risk-high-bg)]',
      iconColor: 'text-[var(--destructive)]',
      badge: 'High Risk',
      badgeClass: 'bg-[var(--risk-high-bg)] text-[var(--risk-high-text)] font-bold animate-pulse',
      accentColor: 'border-[var(--accent-red-border)]',
    },
  ];

  // 2. Risk Distribution Donut Chart Segments
  const riskDonutData: DonutSegment[] = [
    {
      id: 'low-risk',
      label: 'Low Risk (0–7d)',
      value: stats.lowRiskCount || 0,
      color: '#16A34A',
      href: '/customers?risk=low',
    },
    {
      id: 'medium-risk',
      label: 'Medium Risk (8–30d)',
      value: stats.mediumRiskCount || 0,
      color: '#F59E0B',
      href: '/customers?risk=medium',
    },
    {
      id: 'high-risk',
      label: 'High Risk (31+d)',
      value: stats.highRiskCount || 0,
      color: '#EF4444',
      href: '/customers?risk=high',
    },
  ];

  // 3. Recency Velocity Bar Chart Data Points
  const recencyBarData: BarDataPoint[] = (stats.recencyBuckets || []).map((bucket, index) => ({
    id: `recency-${index}`,
    label: bucket.range,
    sublabel: bucket.label.split(' ')[0],
    value: bucket.count,
    percentage: bucket.percentage,
    color: bucket.color,
  }));

  const handleDonutSegmentClick = (segment: DonutSegment) => {
    if (segment.href) {
      router.push(segment.href);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[var(--primary)]" />
            <span>Executive CRM Overview</span>
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-tertiary)]">
            Proactive customer relationship health, visual analytics, and rule-based follow-up risk tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-[14px] gap-2 shadow-xs"
          >
            <Link href="/customers">
              <span>Customer Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className={cn(
                'p-[20px_24px] rounded-[12px] border bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all hover:shadow-md hover:border-[var(--primary)] group flex flex-col justify-between',
                card.accentColor
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[var(--text-secondary)]">
                    {card.title}
                  </span>
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                      card.iconBg,
                      card.iconColor
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">
                    {card.value}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase tracking-wider',
                      card.badgeClass
                    )}
                  >
                    {card.badge}
                  </span>
                </div>

                <p className="mt-2 text-[12px] text-[var(--text-tertiary)] leading-snug">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[13px] font-semibold text-[var(--primary)] group-hover:text-[var(--primary-hover)]">
                <span>View Filtered Accounts</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics Grid: Donut Chart & Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Risk Distribution */}
        <div className="lg:col-span-6 p-6 rounded-[12px] border border-[var(--border-default)] bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                  Follow-up Risk Distribution
                </h3>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Visual breakdown of accounts across rule-based contact recency tiers. Click segments to filter.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[var(--risk-low-bg)] text-[var(--risk-low-text)] px-2 py-1 rounded">
              {stats.healthScore}% Healthy
            </span>
          </div>

          <DonutChart
            data={riskDonutData}
            totalLabel="Accounts"
            onSegmentClick={handleDonutSegmentClick}
          />

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
            <span>Low: ≤7d | Medium: 8–30d | High: &gt;30d</span>
            <Link
              href="/customers?status=active&risk=high"
              className="text-[var(--destructive)] hover:underline font-semibold flex items-center gap-1"
            >
              <span>{stats.needsAttention} Need Attention</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bar Graph: Contact Recency Spectrum */}
        <div className="lg:col-span-6 p-6 rounded-[12px] border border-[var(--border-default)] bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                  Contact Recency Velocity
                </h3>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Distribution of calendar days elapsed since last touchpoint across all customers.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] px-2 py-1 rounded">
              Avg {stats.avgDaysSinceContact}d
            </span>
          </div>

          <BarChart data={recencyBarData} height={160} />

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] text-[var(--text-tertiary)]">
            <span>Normalized to whole calendar days</span>
            <Link
              href="/customers"
              className="text-[var(--primary)] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Open Customer Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Client Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Relationship Performance Metrics Card */}
        <div className="lg:col-span-5 p-6 rounded-[12px] border border-[var(--border-default)] bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
              Portfolio Relationship Metrics
            </h3>
          </div>

          <div className="space-y-4">
            {/* Health Score Metric */}
            <div className="p-4 rounded-[10px] border border-[var(--accent-green-border)] bg-[var(--accent-green-bg)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[var(--risk-low-text)] flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4" />
                  Portfolio Health Ratio
                </span>
                <span className="text-[18px] font-extrabold text-[var(--risk-low-text)]">
                  {stats.healthScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--risk-low-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                  style={{ width: `${stats.healthScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--risk-low-text)] opacity-80">
                {stats.lowRiskCount} of {stats.total} accounts contacted within the past 7 calendar days.
              </p>
            </div>

            {/* Average Days & High-Risk Exposure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>Avg Recency</span>
                </div>
                <p className="text-[20px] font-bold text-[var(--text-primary)]">
                  {stats.avgDaysSinceContact} <span className="text-[13px] font-normal text-[var(--text-tertiary)]">days</span>
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">Average contact interval</p>
              </div>

              <div className="p-3.5 rounded-[10px] border border-[var(--accent-red-border)] bg-[var(--accent-red-bg)] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--risk-high-text)] uppercase">
                  <Zap className="h-3.5 w-3.5" />
                  <span>At-Risk Ratio</span>
                </div>
                <p className="text-[20px] font-bold text-[var(--risk-high-text)]">
                  {stats.active > 0 ? Math.round((stats.needsAttention / stats.active) * 100) : 0}%
                </p>
                <p className="text-[11px] text-[var(--risk-high-text)] opacity-80">Active accounts needing contact</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Client Accounts Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-[12px] border border-[var(--border-default)] bg-[var(--card)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                Top Client Organizations
              </h3>
            </div>
            <span className="text-[12px] text-[var(--text-tertiary)]">Top 5 by Account Volume</span>
          </div>

          <div className="space-y-3">
            {(stats.topCompanies || []).map((comp) => {
              const activeRatio = comp.count > 0 ? Math.round((comp.activeCount / comp.count) * 100) : 0;

              return (
                <Link
                  key={comp.company}
                  href={`/customers?company=${encodeURIComponent(comp.company)}`}
                  className="p-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-colors block group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        {comp.company}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text-tertiary)] bg-[var(--surface-tertiary)] px-1.5 py-0.2 rounded">
                        {comp.activeCount} active
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-[var(--text-primary)]">
                      {comp.count} <span className="text-[11px] font-normal text-[var(--text-tertiary)]">accounts</span>
                    </span>
                  </div>

                  {/* Account concentration bar */}
                  <div className="w-full h-1.5 bg-[var(--border-default)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${activeRatio}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Follow-up Risk Engine Operational Reference */}
      <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--card)] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[var(--accent-green-bg)] border border-[var(--accent-green-border)] flex items-center justify-center text-[var(--primary)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
              Follow-up Risk Intelligence Engine
            </h3>
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Transparent, rule-based contact recency tracking configured across three operational tiers:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-[8px] border border-[var(--accent-green-border)] bg-[var(--accent-green-bg)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--risk-low-text)]">Low Risk</span>
              <span className="text-[11px] font-semibold uppercase bg-[var(--risk-low-bg)] text-[var(--risk-low-text)] px-2 py-0.5 rounded">
                0–7 Days
              </span>
            </div>
            <p className="text-[12px] text-[var(--risk-low-text)] opacity-80 leading-relaxed">
              Recent interaction touchpoint within the past week. Healthy relationship momentum.
            </p>
          </div>

          <div className="p-4 rounded-[8px] border border-[var(--accent-amber-border)] bg-[var(--accent-amber-bg)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--risk-medium-text)]">Medium Risk</span>
              <span className="text-[11px] font-semibold uppercase bg-[var(--risk-medium-bg)] text-[var(--risk-medium-text)] px-2 py-0.5 rounded">
                8–30 Days
              </span>
            </div>
            <p className="text-[12px] text-[var(--risk-medium-text)] opacity-80 leading-relaxed">
              Moderate lapse since last communication. Approaching recommended touchpoint cycle.
            </p>
          </div>

          <div className="p-4 rounded-[8px] border border-[var(--accent-red-border)] bg-[var(--accent-red-bg)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[var(--risk-high-text)]">High Risk</span>
              <span className="text-[11px] font-semibold uppercase bg-[var(--risk-high-bg)] text-[var(--risk-high-text)] px-2 py-0.5 rounded">
                31+ Days
              </span>
            </div>
            <p className="text-[12px] text-[var(--risk-high-text)] opacity-80 leading-relaxed">
              No logged contact for over a month. Active accounts in this tier immediately trigger the <strong>Needs Attention</strong> workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
