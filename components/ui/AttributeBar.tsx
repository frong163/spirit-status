'use client';

import { ATTRIBUTE_CONFIG } from '@/lib/game';
import type { UserAttributes } from '@/types';

interface AttributeBarProps {
  attribute: keyof UserAttributes;
  value: number;
  previousValue?: number;
  showChange?: boolean;
  size?: 'sm' | 'md';
}

export default function AttributeBar({ attribute, value, previousValue, showChange, size = 'md' }: AttributeBarProps) {
  const config = ATTRIBUTE_CONFIG[attribute];
  const change = showChange && previousValue !== undefined ? value - previousValue : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: config.color }}>
          <span>{config.emoji}</span>
          <span className="font-cinzel tracking-wide">{config.label}</span>
        </span>
        <div className="flex items-center gap-2">
          {change !== 0 && (
            <span className={`text-xs font-mono font-bold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? `+${change}` : change}
            </span>
          )}
          <span className={`font-mono font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: config.color }}>
            {value}
          </span>
        </div>
      </div>
      <div className={`w-full rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`} style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${config.progressClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
