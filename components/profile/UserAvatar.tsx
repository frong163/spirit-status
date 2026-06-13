import { getTierColor } from '@/lib/game';
import type { AuraTier } from '@/types';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  tier: AuraTier;
  size?: number;
  animate?: boolean;
}

export default function UserAvatar({ username, avatarUrl, tier, size = 64, animate = true }: UserAvatarProps) {
  const color = getTierColor(tier);
  const fontSize = Math.round(size * 0.35);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow */}
      {animate && (
        <div
          className="absolute inset-0 rounded-full animate-pulse-slow"
          style={{
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            filter: 'blur(6px)',
            transform: 'scale(1.3)',
          }}
        />
      )}

      {/* Avatar */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center font-cinzel font-black"
        style={{
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `2px solid ${color}70`,
          color,
          fontSize,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
        ) : (
          username.charAt(0).toUpperCase()
        )}
      </div>
    </div>
  );
}
