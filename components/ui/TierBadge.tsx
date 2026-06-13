import { getTierColor, getTierEmoji } from '@/lib/game';
import type { AuraTier } from '@/types';

interface TierBadgeProps {
  tier: AuraTier;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export default function TierBadge({ tier, size = 'md', showEmoji = true }: TierBadgeProps) {
  const color = getTierColor(tier);
  const emoji = getTierEmoji(tier);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-cinzel font-semibold border ${sizeClasses[size]}`}
      style={{
        color,
        borderColor: `${color}60`,
        background: `${color}15`,
        textShadow: tier === 'Celestial' ? `0 0 10px ${color}80` : 'none',
        boxShadow: tier === 'Celestial' ? `0 0 15px ${color}30` : 'none',
      }}
    >
      {showEmoji && <span>{emoji}</span>}
      {tier}
    </span>
  );
}
