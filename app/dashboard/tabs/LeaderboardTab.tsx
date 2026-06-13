'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { AuraTier, UserAttributes } from '@/types';

type LBType = 'spirit' | keyof UserAttributes;

const TABS: { id: LBType; label: string; emoji: string }[] = [
  { id: 'spirit', label: 'Spirit', emoji: '✨' },
  { id: 'luck', label: 'โชค', emoji: '🍀' },
  { id: 'wealth', label: 'การเงิน', emoji: '💰' },
  { id: 'love', label: 'ความรัก', emoji: '❤️' },
  { id: 'career', label: 'การงาน', emoji: '💼' },
  { id: 'energy', label: 'พลังงาน', emoji: '⚡' },
];

export default function LeaderboardTab({ user }: TabProps) {
  const supabase = createClient();
  const [active, setActive] = useState<LBType>('spirit');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const view = active === 'spirit' ? 'leaderboard_spirit' : `leaderboard_${active}`;
      const { data } = await supabase.from(view).select('*').limit(50);
      setEntries(data ?? []);
      setLoading(false);
    })();
  }, [active, supabase]);

  const getValue = (e: any) => active === 'spirit' ? parseFloat(e.spirit_score).toFixed(1) : e[active];

  return (
    <div className="space-y-4 animate-fadeInUp">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#1E1B4B' }}>อันดับ & รายงาน</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>แข่งขันกับผู้เล่นทั่วโลก</p>
      </div>

      {/* Tab scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
            style={active === t.id
              ? { background: '#7C3AED', color: 'white' }
              : { background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            <span>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="card p-4">
          <div className="flex items-end justify-center gap-3">
            {[1, 0, 2].map(i => {
              const e = entries[i];
              if (!e) return null;
              const isFirst = i === 0;
              const tierColor = getTierColor(e.aura_tier as AuraTier);
              return (
                <div key={i} className={`flex flex-col items-center gap-1 ${isFirst ? 'mb-0' : 'mb-0'}`}>
                  {isFirst && <div className="text-2xl">👑</div>}
                  <div className="rounded-full flex items-center justify-center font-bold"
                    style={{ width: isFirst ? 52 : 40, height: isFirst ? 52 : 40, background: tierColor + '20', border: `2px solid ${tierColor}`, color: tierColor, fontSize: isFirst ? 18 : 14 }}>
                    {e.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs font-semibold text-center max-w-16 truncate" style={{ color: '#1E1B4B' }}>{e.username}</div>
                  <div className="text-xs font-bold" style={{ color: '#7C3AED' }}>{getValue(e)}</div>
                  <div className="rounded-t-lg flex items-center justify-center"
                    style={{ width: isFirst ? 72 : 56, height: isFirst ? 60 : 44, background: isFirst ? '#FEF3C7' : i === 1 ? '#F3F4F6' : '#FEF3C7', border: '1px solid #E5E7EB' }}>
                    <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {loading ? Array.from({length:5}).map((_,i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#F3F4F6' }} />
        )) : entries.slice(3).map((e, idx) => {
          const isMe = e.user_id === user.id;
          const tierColor = getTierColor(e.aura_tier as AuraTier);
          return (
            <div key={e.user_id} className="card card-hover p-3 flex items-center gap-3"
              style={isMe ? { border: '2px solid #7C3AED', background: '#FAF8FF' } : {}}>
              <div className="w-8 text-center font-bold text-sm" style={{ color: '#9CA3AF' }}>#{idx + 4}</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: tierColor + '20', border: `1.5px solid ${tierColor}`, color: tierColor }}>
                {e.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-1" style={{ color: '#1E1B4B' }}>
                  {e.username}
                  {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#7C3AED' }}>คุณ</span>}
                </div>
                <div className="text-xs flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  <span>{getTierEmoji(e.aura_tier)}</span>
                  <span>{e.aura_tier}</span>
                  {e.daily_streak >= 3 && <span>🔥{e.daily_streak}</span>}
                </div>
              </div>
              <div className="font-bold" style={{ color: '#7C3AED' }}>{getValue(e)}</div>
            </div>
          );
        })}
        {entries.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌌</div>
            <p className="font-semibold" style={{ color: '#9CA3AF' }}>ยังไม่มีผู้เล่น</p>
            <p className="text-sm mt-1" style={{ color: '#D1D5DB' }}>เป็นคนแรกที่จั่วไพ่!</p>
          </div>
        )}
      </div>
    </div>
  );
}
