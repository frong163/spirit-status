import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { calculateSpiritScore, getAuraTier, getTierColor, getRankSuffix, getTopPercentage, ATTRIBUTE_CONFIG } from '@/lib/game';
import { getCardById } from '@/lib/tarot';
import TierBadge from '@/components/ui/TierBadge';
import AttributeBar from '@/components/ui/AttributeBar';
import type { UserAttributes, AuraTier } from '@/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Spirit Status`,
    description: `Check out ${username}'s aura and spirit score on Spirit Status`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  const attributes: UserAttributes = {
    luck: profile.luck ?? 50,
    wealth: profile.wealth ?? 50,
    love: profile.love ?? 50,
    career: profile.career ?? 50,
    energy: profile.energy ?? 50,
  };

  const spiritScore = calculateSpiritScore(attributes);
  const aura: AuraTier = getAuraTier(spiritScore);
  const tierColor = getTierColor(aura);

  // Get rank
  const { count: rankCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('spirit_score', spiritScore);
  const { count: total } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const rank = (rankCount ?? 0) + 1;
  const topPct = getTopPercentage(rank, total ?? 1);

  // Get draw history
  const { data: history } = await supabase
    .from('draw_history')
    .select('*')
    .eq('user_id', profile.id)
    .order('drawn_at', { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 stars-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${tierColor}15 0%, transparent 60%)` }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/leaderboard" className="text-oracle-light/40 hover:text-oracle-light/70 text-sm transition-colors">
            ← Leaderboard
          </Link>
          <div className="font-cinzel font-black text-sm">
            <span className="gold-text">SPIRIT</span>
            <span className="text-oracle-light"> STATUS</span>
          </div>
          <Link href="/login" className="text-oracle-gold/70 hover:text-oracle-gold text-sm font-cinzel transition-colors">
            Play →
          </Link>
        </div>

        {/* Profile hero */}
        <div className="spirit-card rounded-3xl p-6 text-center mb-4"
          style={{ boxShadow: `0 0 50px ${tierColor}20` }}>

          {/* Avatar with aura */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full animate-pulse-slow"
              style={{ background: `radial-gradient(circle, ${tierColor}30 0%, transparent 70%)`, filter: 'blur(10px)' }} />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center font-cinzel font-black text-3xl relative"
              style={{
                background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`,
                border: `3px solid ${tierColor}70`,
                color: tierColor,
                boxShadow: `0 0 30px ${tierColor}40`,
              }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <h1 className="font-cinzel font-bold text-oracle-light text-2xl mb-2">{profile.username}</h1>
          <TierBadge tier={aura} size="lg" />

          <div className="mt-4 mb-2">
            <div className="font-mono font-black text-5xl gold-text">{spiritScore.toFixed(1)}</div>
            <div className="text-oracle-light/40 text-xs font-cinzel tracking-wider">SPIRIT SCORE</div>
          </div>

          {/* Stats row */}
          <div className="flex justify-around mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-center">
              <div className="font-mono font-bold text-oracle-gold text-lg">
                #{rank}<span className="text-xs text-oracle-gold/60">{getRankSuffix(rank)}</span>
              </div>
              <div className="text-oracle-light/40 text-xs font-cinzel">Global</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-oracle-gold text-lg">Top {topPct}%</div>
              <div className="text-oracle-light/40 text-xs font-cinzel">Percentile</div>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-oracle-gold text-lg">🔥 {profile.daily_streak ?? 0}</div>
              <div className="text-oracle-light/40 text-xs font-cinzel">Streak</div>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="spirit-card rounded-2xl p-5 mb-4">
          <h2 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-4">ATTRIBUTES</h2>
          <div className="space-y-3">
            {(Object.keys(attributes) as (keyof UserAttributes)[]).map(attr => (
              <AttributeBar key={attr} attribute={attr} value={attributes[attr]} />
            ))}
          </div>
        </div>

        {/* Badges */}
        {(profile.badges as any[])?.length > 0 && (
          <div className="spirit-card rounded-2xl p-4 mb-4">
            <h2 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-3">BADGES</h2>
            <div className="flex flex-wrap gap-2">
              {(profile.badges as any[]).map((badge: any) => (
                <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#E8D5A3' }}>
                  <span>{badge.emoji}</span>
                  <span className="font-cinzel">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarot history */}
        {history && history.length > 0 && (
          <div className="spirit-card rounded-2xl p-4 mb-6">
            <h2 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-3">TAROT HISTORY</h2>
            <div className="space-y-2">
              {history.map((record: any) => {
                const card = getCardById(record.card_id);
                return (
                  <div key={record.id} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{card?.emoji ?? '🃏'}</span>
                      <div>
                        <div className="text-sm text-oracle-light">{record.card_name}</div>
                        <div className="text-xs text-oracle-light/40">
                          {new Date(record.drawn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-oracle-gold">{record.spirit_score_after?.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/login?mode=signup"
          className="block w-full py-4 text-center rounded-2xl font-cinzel font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #7B2FBE, #C9A84C)',
            color: 'white',
            boxShadow: '0 0 30px rgba(123,47,190,0.4)',
          }}
        >
          ✦ Build Your Own Spirit Status ✦
        </Link>
      </div>
    </main>
  );
}
