import React from 'react';
import { RiskLevel } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface FollowUpRiskBadgeProps {
  risk: RiskLevel;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function FollowUpRiskBadge({
  risk,
  className,
  showIcon = true,
  compact = false,
}: FollowUpRiskBadgeProps) {
  const config = {
    low: {
      label: compact ? 'Low' : 'Low Risk',
      bgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      iconClass: 'text-emerald-500',
      Icon: CheckCircle2,
    },
    medium: {
      label: compact ? 'Med' : 'Medium Risk',
      bgClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      iconClass: 'text-amber-500',
      Icon: Clock,
    },
    high: {
      label: compact ? 'High' : 'High Risk',
      bgClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-semibold',
      iconClass: 'text-rose-500',
      Icon: AlertTriangle,
    },
  }[risk];

  const IconComponent = config.Icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        config.bgClass,
        className
      )}
    >
      {showIcon && <IconComponent className={cn('h-3.5 w-3.5 shrink-0', config.iconClass)} />}
      <span>{config.label}</span>
    </Badge>
  );
}
