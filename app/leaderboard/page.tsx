import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import TierBadge from '@/components/ui/TierBadge';
import { getTierColor, getRankSuffix, LEADERBOARD_CONFIG, ATTRIBUTE_CONFIG } from '@/lib/game';
import type { AuraTier, LeaderboardEntry } from '@/types';

export const revalidate = 60;

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('leaderboard_spirit')
      .select('*')
      .limit(100);

    if (!data) return [];

    return data.map((row: any) => ({
      rank: row.rank,
      user_id: row.user_id,
      username: row.username,
      avatar_url: row.avatar_url,
      spirit_score: parseFloat(row.spirit_score),
      aura_tier: row.aura_tier as AuraTier,
      daily_streak: row.daily_streak,
      attributes: {
        luck: row.luck,
        wealth: row.wealth,
        love: row.love,
        career: row.career,
        energy: row.energy,
      },
    }));
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 stars-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(123,47,190,0.12) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-oracle-light/40 hover:text-oracle-light/70 text-sm transition-colors">
            ← Home
          </Link>
          <div className="font-cinzel font-black text-base text-center">
            <span className="gold-text">SPIRIT</span>
            <span className="text-oracle-light"> STATUS</span>
          </div>
          <Link href="/login" className="text-oracle-gold/70 hover:text-oracle-gold text-sm font-cinzel transition-colors">
            Play →
          </Link>
        </div>

        <h1 className="font-cinzel font-black text-2xl text-center mb-1">
          <span className="gold-text">Global Rankings</span>
        </h1>
        <p className="text-center text-oracle-light/40 text-sm mb-6">
          {entries.length > 0 ? `${entries.length} souls competing` : 'Be the first to draw a card!'}
        </p>

        {/* Podium - top 3 */}
        {top3.length >= 1 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-2 mb-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-cinzel font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${getTierColor(top3[1].aura_tier)}30, ${getTierColor(top3[1].aura_tier)}10)`,
                    border: `2px solid ${getTierColor(top3[1].aura_tier)}60`,
                    color: getTierColor(top3[1].aura_tier),
                  }}>
                  {top3[1].username.charAt(0).toUpperCase()}
                </div>
                <p className="text-oracle-light/80 text-xs font-medium truncate max-w-[70px] text-center">
                  {top3[1].username}
                </p>
                <p className="font-mono text-sm font-bold text-oracle-light/70">{top3[1].spirit_score.toFixed(1)}</p>
                <div className="w-20 rounded-t-lg flex items-center justify-center py-3"
                  style={{ background: 'linear-gradient(180deg, rgba(148,163,184,0.3), rgba(148,163,184,0.1))', height: 60, border: '1px solid rgba(148,163,184,0.3)' }}>
                  <span className="text-xl">🥈</span>
                </div>
              </div>
            )}

            {/* 1st place */}
            <div className="flex flex-col items-center gap-2 -mt-4">
              <div className="text-2xl">👑</div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-cinzel font-bold text-xl"
                style={{
                  background: `linear-gradient(135deg, ${getTierColor(top3[0].aura_tier)}40, ${getTierColor(top3[0].aura_tier)}15)`,
                  border: `2px solid ${getTierColor(top3[0].aura_tier)}80`,
                  color: getTierColor(top3[0].aura_tier),
                  boxShadow: `0 0 25px ${getTierColor(top3[0].aura_tier)}40`,
                }}>
                {top3[0].username.charAt(0).toUpperCase()}
              </div>
              <p className="text-oracle-light text-sm font-medium truncate max-w-[80px] text-center">
                {top3[0].username}
              </p>
              <p className="font-mono text-base font-bold gold-text">{top3[0].spirit_score.toFixed(1)}</p>
              <div className="w-24 rounded-t-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))', height: 80, border: '1px solid rgba(201,168,76,0.4)' }}>
                <span className="text-2xl">🥇</span>
              </div>
            </div>

            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-cinzel font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${getTierColor(top3[2].aura_tier)}30, ${getTierColor(top3[2].aura_tier)}10)`,
                    border: `2px solid ${getTierColor(top3[2].aura_tier)}60`,
                    color: getTierColor(top3[2].aura_tier),
                  }}>
                  {top3[2].username.charAt(0).toUpperCase()}
                </div>
                <p className="text-oracle-light/80 text-xs font-medium truncate max-w-[70px] text-center">
                  {top3[2].username}
                </p>
                <p className="font-mono text-sm font-bold text-oracle-light/70">{top3[2].spirit_score.toFixed(1)}</p>
                <div className="w-20 rounded-t-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(180deg, rgba(180,100,0,0.3), rgba(180,100,0,0.1))', height: 45, border: '1px solid rgba(180,100,0,0.3)' }}>
                  <span className="text-xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rest of leaderboard */}
        <div className="space-y-2 mb-8">
          {rest.map(entry => (
            <Link
              key={entry.user_id}
              href={`/u/${entry.username}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-7 text-center flex-shrink-0">
                <span className="font-mono text-sm text-oracle-light/50">#{entry.rank}</span>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-cinzel font-bold text-sm"
                style={{
                  background: `${getTierColor(entry.aura_tier)}20`,
                  border: `1px solid ${getTierColor(entry.aura_tier)}40`,
                  color: getTierColor(entry.aura_tier),
                }}
              >
                {entry.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-oracle-light truncate">{entry.username}</span>
                  {entry.daily_streak >= 7 && <span className="text-xs">🔥{entry.daily_streak}</span>}
                </div>
                <TierBadge tier={entry.aura_tier} size="sm" />
              </div>
              <div className="font-mono font-bold text-oracle-gold">{entry.spirit_score.toFixed(1)}</div>
            </Link>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌌</div>
              <p className="font-cinzel text-oracle-light/50 mb-2">The cosmos awaits its first champion.</p>
              <Link href="/login?mode=signup" className="text-oracle-gold hover:underline text-sm font-cinzel">
                Be the first to draw →
              </Link>
            </div>
          )}
        </div>

        {/* Join CTA */}
        <Link
          href="/login?mode=signup"
          className="block w-full py-4 text-center rounded-2xl font-cinzel font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #7B2FBE, #C9A84C)',
            color: 'white',
            boxShadow: '0 0 30px rgba(123,47,190,0.4)',
          }}
        >
          ✦ Join the Rankings ✦
        </Link>
      </div>
    </main>
  );
}
