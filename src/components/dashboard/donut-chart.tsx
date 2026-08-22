'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  href?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  totalLabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  onSegmentClick?: (segment: DonutSegment) => void;
}

export function DonutChart({
  data,
  totalLabel = 'Total',
  size = 180,
  strokeWidth = 24,
  className,
  onSegmentClick,
}: DonutChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  const hoveredSegment = data.find((d) => d.id === hoveredId);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center gap-6', className)}>
      {/* SVG Donut Circle */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--surface-inset)"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((segment) => {
              const segmentPercentage = segment.value / total;
              const strokeDasharray = `${circumference * segmentPercentage} ${circumference * (1 - segmentPercentage)}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += circumference * segmentPercentage;

              const isHovered = hoveredId === segment.id;

              return (
                <circle
                  key={segment.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredId(segment.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSegmentClick?.(segment)}
                />
              );
            })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[22px] font-bold text-[var(--text-primary)] leading-none">
            {hoveredSegment ? hoveredSegment.value : total}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mt-1">
            {hoveredSegment ? hoveredSegment.label : totalLabel}
          </span>
          {hoveredSegment && total > 0 && (
            <span className="text-[10px] text-[var(--primary)] font-bold mt-0.5">
              {Math.round((hoveredSegment.value / total) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 w-full space-y-2.5">
        {data.map((segment) => {
          const percent = total > 0 ? Math.round((segment.value / total) * 100) : 0;
          const isHovered = hoveredId === segment.id;

          return (
            <div
              key={segment.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer border border-transparent',
                isHovered ? 'bg-[var(--surface-secondary)] border-[var(--border-default)]' : 'hover:bg-[var(--surface-hover)]'
              )}
              onMouseEnter={() => setHoveredId(segment.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSegmentClick?.(segment)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                  {segment.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-[var(--text-primary)]">
                  {segment.value}
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] w-10 text-right">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
