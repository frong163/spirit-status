'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { AuraTier, UserAttributes } from '@/types';

type LBType = 'spirit' | keyof UserAttributes;

const TABS: { id: LBType; label: string; emoji: string }[] = [
  { id: 'spirit', label: 'Spirit',   emoji: '✨' },
  { id: 'luck',   label: 'โชคลาภ',  emoji: '🍀' },
  { id: 'wealth', label: 'การเงิน',  emoji: '💰' },
  { id: 'love',   label: 'ความรัก', emoji: '❤️' },
  { id: 'career', label: 'การงาน',  emoji: '💼' },
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
  }, [active]);

  const getVal = (e: any) =>
    active === 'spirit' ? parseFloat(e.spirit_score).toFixed(1) : String(e[active]);

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  return (
    <div className="pb-nav flex flex-col gap-4 pt-2">
      <div>
        <h1 className="text-2xl font-black text-foreground">อันดับ 🏆</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">แข่งขันกับผู้เล่นทั่วโลก</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold transition-all"
            style={active === t.id
              ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', boxShadow: '0 4px 12px rgba(124,58,237,.3)', border: 'none' }
              : { background: 'white', color: '#71717A', boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: 'none', cursor: 'pointer' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      {!loading && top3.length >= 1 && (
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <div className="flex items-end justify-center gap-4">
            {[1, 0, 2].map(i => {
              if (!top3[i]) return <div key={i} style={{ width: 80 }} />;
              const e = top3[i];
              const tc = getTierColor(e.aura_tier as AuraTier);
              const isFirst = i === 0;
              const podiumH = [72, 52, 40][i];
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  {isFirst && <span className="text-2xl">👑</span>}
                  <div className="flex items-center justify-center rounded-full font-black"
                    style={{ width: isFirst ? 54 : 42, height: isFirst ? 54 : 42, background: `${tc}18`, border: `2.5px solid ${tc}`, color: tc, fontSize: isFirst ? 20 : 15, boxShadow: isFirst ? `0 0 20px ${tc}40` : undefined }}>
                    {e.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="max-w-[72px] truncate text-xs font-bold text-foreground text-center">{e.username}</p>
                  <p className="text-xs font-black text-primary">{getVal(e)}</p>
                  <div className="flex w-full items-center justify-center rounded-t-xl"
                    style={{ width: isFirst ? 72 : 56, height: podiumH, background: isFirst ? '#FEF3C7' : i === 1 ? '#F4F4F5' : '#FEF9EE', border: '1.5px solid', borderColor: isFirst ? '#F59E0B' : '#E4E4E7', borderBottom: 'none' }}>
                    <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-secondary" style={{ animation: 'pulseSoft 1.5s ease-in-out infinite' }} />
            ))
          : rest.map((e, idx) => {
              const isMe = e.user_id === user.id;
              const tc   = getTierColor(e.aura_tier as AuraTier);
              return (
                <div key={e.user_id}
                  className="flex items-center gap-3 rounded-2xl p-3.5"
                  style={{ background: isMe ? '#FAF8FF' : 'white', border: `1.5px solid ${isMe ? '#7C3AED' : '#F4F4F5'}`, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                  <span className="w-7 text-center text-sm font-black text-muted-foreground">#{idx + 4}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-sm"
                    style={{ background: `${tc}18`, border: `2px solid ${tc}`, color: tc }}>
                    {e.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">{e.username}</span>
                      {isMe && <span className="rounded-lg px-1.5 py-0.5 text-xs font-bold" style={{ background: '#EDE9FE', color: '#7C3AED' }}>คุณ</span>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{getTierEmoji(e.aura_tier)}</span>
                      <span>{e.aura_tier}</span>
                      {e.daily_streak >= 3 && <span>· 🔥{e.daily_streak}</span>}
                    </div>
                  </div>
                  <span className="text-base font-black text-primary">{getVal(e)}</span>
                </div>
              );
            })
        }
        {!loading && entries.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🌌</div>
            <p className="font-bold text-muted-foreground">ยังไม่มีผู้เล่น</p>
            <p className="mt-1 text-sm text-muted-foreground" style={{ opacity: .6 }}>เป็นคนแรกที่จั่วไพ่!</p>
          </div>
        )}
      </div>
    </div>
  );
}
