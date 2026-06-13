'use client';
import { useState } from 'react';
import type { LeaderboardEntry } from '@/types';
import { getTierColor, ATTR_CONFIG } from '@/lib/game';
import TierBadge from '@/components/ui/TierBadge';
import type { LeaderboardType } from '@/types';

const LB_TABS = [
  { id: 'spirit' as const, label: 'Spirit', emoji: '✨' },
  { id: 'luck' as const, label: 'โชคลาภ', emoji: '🍀' },
  { id: 'wealth' as const, label: 'การเงิน', emoji: '💰' },
  { id: 'love' as const, label: 'ความรัก', emoji: '❤️' },
  { id: 'career' as const, label: 'การงาน', emoji: '💼' },
  { id: 'energy' as const, label: 'พลังงาน', emoji: '⚡' },
];

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}

export default function Leaderboard({ entries, currentUserId, isLoading }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('spirit');
  const tabs = LB_TABS;

  const getSorted = () => {
    if (activeTab === 'spirit') return entries;
    return [...entries].sort((a, b) => b.attributes[activeTab] - a.attributes[activeTab]).map((e, i) => ({ ...e, rank: i + 1 }));
  };

  const getVal = (entry: LeaderboardEntry) =>
    activeTab === 'spirit' ? entry.spirit_score.toFixed(1) : entry.attributes[activeTab].toString();

  return (
    <div className="w-full">
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
            style={activeTab === t.id ? { background: '#7C3AED', color: 'white' } : { background: '#F3F4F6', color: '#6B7280' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {isLoading ? Array.from({length:5}).map((_,i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{background:'#F3F4F6'}} />) :
          getSorted().map((entry) => {
            const isMe = entry.user_id === currentUserId;
            const tc = getTierColor(entry.aura_tier);
            return (
              <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: isMe ? '#FAF8FF' : 'white', border: `1px solid ${isMe ? '#7C3AED' : '#F3F4F6'}` }}>
                <div className="w-7 text-center text-sm font-bold" style={{ color: '#9CA3AF' }}>
                  {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: tc + '20', border: `1.5px solid ${tc}`, color: tc }}>
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#1E1B4B' }}>
                    {entry.username}{isMe && <span className="ml-1 text-xs px-1 rounded" style={{background:'#EDE9FE',color:'#7C3AED'}}>คุณ</span>}
                  </div>
                  <TierBadge tier={entry.aura_tier} size="sm" />
                </div>
                <div className="font-bold" style={{ color: '#7C3AED' }}>{getVal(entry)}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
