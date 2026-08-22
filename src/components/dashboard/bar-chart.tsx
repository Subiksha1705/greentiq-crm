'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface BarDataPoint {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  percentage: number;
  color: string;
  href?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  className?: string;
  onBarClick?: (bar: BarDataPoint) => void;
}

export function BarChart({
  data,
  height = 180,
  className,
  onBarClick,
}: BarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('w-full flex flex-col justify-end space-y-3', className)}>
      {/* Visual Bars Container */}
      <div
        className="relative w-full flex items-end justify-between gap-3 pt-6 border-b border-[#E5E7EB]"
        style={{ height }}
      >
        {/* Subtle Horizontal Reference Grid Lines */}
        <div className="absolute inset-x-0 top-0 border-b border-dashed border-[#F1F5F9]" />
        <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#F1F5F9]" />

        {data.map((item) => {
          const heightRatio = item.value / maxValue;
          const barHeightPercent = Math.max(10, Math.round(heightRatio * 100));
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onBarClick?.(item)}
            >
              {/* Tooltip / Count on Top */}
              <div
                className={cn(
                  'mb-1.5 transition-all text-center',
                  isHovered ? 'scale-110' : 'opacity-80'
                )}
              >
                <span className="text-[12px] font-bold text-[#1A1D23] block leading-none">
                  {item.value}
                </span>
                <span className="text-[10px] text-[#6B7280] font-medium leading-tight">
                  {item.percentage}%
                </span>
              </div>

              {/* Vertical Bar Element */}
              <div className="w-full max-w-[48px] bg-[#F1F5F9] rounded-t-[6px] overflow-hidden flex items-end h-full">
                <div
                  className={cn(
                    'w-full rounded-t-[6px] transition-all duration-300 shadow-xs',
                    isHovered ? 'brightness-110 ring-2 ring-emerald-500/20' : ''
                  )}
                  style={{
                    height: `${barHeightPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between gap-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex-1 text-center truncate px-0.5"
            title={item.sublabel ? `${item.label} (${item.sublabel})` : item.label}
          >
            <span className="text-[12px] font-semibold text-[#374151] block truncate">
              {item.label}
            </span>
            {item.sublabel && (
              <span className="text-[10px] text-[#9CA3AF] block truncate">
                {item.sublabel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
