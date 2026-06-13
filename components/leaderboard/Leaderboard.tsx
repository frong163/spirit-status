'use client';

import { useState } from 'react';
import type { LeaderboardEntry, LeaderboardType } from '@/types';
import { LEADERBOARD_CONFIG, getTierColor, getRankSuffix, ATTRIBUTE_CONFIG } from '@/lib/game';
import TierBadge from '@/components/ui/TierBadge';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}

export default function Leaderboard({ entries, currentUserId, isLoading }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('spirit');

  const tabs: LeaderboardType[] = ['spirit', 'luck', 'wealth', 'love', 'career', 'energy'];

  const getSortedEntries = () => {
    if (activeTab === 'spirit') return entries;
    return [...entries].sort((a, b) => b.attributes[activeTab] - a.attributes[activeTab])
      .map((e, i) => ({ ...e, rank: i + 1 }));
  };

  const getDisplayValue = (entry: LeaderboardEntry) => {
    if (activeTab === 'spirit') return entry.spirit_score.toFixed(1);
    return entry.attributes[activeTab].toString();
  };

  const getValueColor = () => {
    if (activeTab === 'spirit') return '#C9A84C';
    return ATTRIBUTE_CONFIG[activeTab]?.color ?? '#C9A84C';
  };

  const sorted = getSortedEntries();

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-cinzel font-semibold tracking-wide transition-all duration-200
              ${activeTab === tab
                ? 'text-void' : 'text-oracle-light/50 hover:text-oracle-light/80'
              }
            `}
            style={activeTab === tab ? {
              background: `linear-gradient(135deg, ${LEADERBOARD_CONFIG[tab].emoji === '✨' ? '#C9A84C' : (ATTRIBUTE_CONFIG[tab as keyof typeof ATTRIBUTE_CONFIG]?.color ?? '#C9A84C')}, rgba(201,168,76,0.7))`,
            } : {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {LEADERBOARD_CONFIG[tab].emoji} {LEADERBOARD_CONFIG[tab].label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-oracle-light/40">
            <div className="text-4xl mb-3">🌌</div>
            <p className="font-cinzel">No souls found yet.</p>
            <p className="text-sm mt-1">Be the first to draw a card!</p>
          </div>
        ) : (
          sorted.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId;
            const tierColor = getTierColor(entry.aura_tier);
            const rank = entry.rank;

            return (
              <div
                key={entry.user_id}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${isCurrentUser ? 'ring-1' : ''}
                `}
                style={{
                  background: isCurrentUser
                    ? 'rgba(123,47,190,0.2)'
                    : index < 3 ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrentUser ? 'rgba(123,47,190,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  ...(isCurrentUser && { boxShadow: '0 0 20px rgba(123,47,190,0.15)' }),
                }}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {rank === 1 ? <span className="text-xl">👑</span>
                    : rank === 2 ? <span className="text-xl">🥈</span>
                    : rank === 3 ? <span className="text-xl">🥉</span>
                    : <span className="font-mono text-sm text-oracle-light/50">#{rank}</span>
                  }
                </div>

                {/* Avatar placeholder */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-cinzel font-bold text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`,
                    border: `1px solid ${tierColor}50`,
                    color: tierColor,
                  }}
                >
                  {entry.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-oracle-light truncate">
                      {entry.username}
                      {isCurrentUser && <span className="text-mystic text-xs ml-1">(you)</span>}
                    </span>
                    {entry.daily_streak >= 3 && (
                      <span className="text-xs">🔥{entry.daily_streak}</span>
                    )}
                  </div>
                  <TierBadge tier={entry.aura_tier} size="sm" />
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-mono font-bold text-base"
                    style={{ color: getValueColor() }}
                  >
                    {getDisplayValue(entry)}
                  </div>
                  <div className="text-xs text-oracle-light/40 font-mono">
                    {LEADERBOARD_CONFIG[activeTab].emoji}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
