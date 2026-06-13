'use client';
import { ATTR_CONFIG } from '@/lib/game';
import type { UserAttributes } from '@/types';

interface AttributeBarProps {
  attribute: keyof UserAttributes;
  value: number;
  previousValue?: number;
  showChange?: boolean;
  size?: 'sm' | 'md';
}

export default function AttributeBar({ attribute, value, previousValue, showChange, size = 'md' }: AttributeBarProps) {
  const config = ATTR_CONFIG[attribute];
  const change = showChange && previousValue !== undefined ? value - previousValue : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: config.color }}>
          <span>{config.emoji}</span>
          <span>{config.labelTh}</span>
        </span>
        <div className="flex items-center gap-2">
          {change !== 0 && <span className={`text-xs font-bold ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>{change > 0 ? `+${change}` : change}</span>}
          <span className={`font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: config.color }}>{value}</span>
        </div>
      </div>
      <div className={`w-full rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`} style={{ background: '#F3F4F6' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: config.gradient }} />
      </div>
    </div>
  );
}
