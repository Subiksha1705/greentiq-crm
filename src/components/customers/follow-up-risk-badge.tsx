import React from 'react';
import { RiskLevel } from '@/types/customer';
import { cn } from '@/lib/utils';

interface FollowUpRiskBadgeProps {
  risk: RiskLevel;
  className?: string;
  compact?: boolean;
}

export function FollowUpRiskBadge({
  risk,
  className,
  compact = false,
}: FollowUpRiskBadgeProps) {
  const config = {
    low: {
      label: compact ? 'Low' : 'Low Risk',
      bg: '#DCFCE7',
      text: '#166534',
      dot: '#22C55E',
    },
    medium: {
      label: compact ? 'Med' : 'Medium Risk',
      bg: '#FEF3C7',
      text: '#92400E',
      dot: '#F59E0B',
    },
    high: {
      label: compact ? 'High' : 'High Risk',
      bg: '#FEE2E2',
      text: '#991B1B',
      dot: '#EF4444',
    },
  }[risk];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-[4px] text-[12px] font-semibold leading-none transition-colors border-0',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      <span
        className="h-[6px] w-[6px] rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      <span>{config.label}</span>
    </span>
  );
}
