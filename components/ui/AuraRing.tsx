'use client';
import { getTierColor } from '@/lib/game';
import type { AuraTier } from '@/types';

interface AuraRingProps {
  tier: AuraTier;
  size?: number;
  children?: React.ReactNode;
  animate?: boolean;
  className?: string;
}

export default function AuraRing({ tier, size = 120, children, animate = true, className = '' }: AuraRingProps) {
  const color = getTierColor(tier);
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div className={`absolute inset-0 rounded-full ${animate ? 'animate-pulse-slow' : ''}`}
        style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, filter: 'blur(8px)' }} />
      {animate && (
        <svg className="absolute inset-0 animate-spin-slow" viewBox="0 0 100 100" style={{ width: size, height: size }}>
          <defs>
            <linearGradient id={`ring-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#ring-${tier})`} strokeWidth="2" strokeDasharray="200 90" />
        </svg>
      )}
      <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}40` }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
