'use client';



import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  calculateSpiritScore, getAuraTier, applyAttributeEffects,
  formatScore, getRankSuffix, getTopPercentage, getTierColor,
  isNewDay, getStreakReward, DEFAULT_ATTRIBUTES
} from '@/lib/game';
import { getRandomCard, getCardById } from '@/lib/tarot';
import type { User, TarotCard, DrawRecord, ShareCardData, UserAttributes } from '@/types';
import AuraRing from '@/components/ui/AuraRing';
import TierBadge from '@/components/ui/TierBadge';
import AttributeBar from '@/components/ui/AttributeBar';
import SpiritRadarChart from '@/components/ui/SpiritRadarChart';
import TarotCardDraw from '@/components/tarot/TarotCardDraw';
import DailyExtras from '@/components/tarot/DailyExtras';
import ShareCard from '@/components/share/ShareCard';
import StreakDisplay from '@/components/dashboard/StreakDisplay';

type DashboardTab = 'home' | 'draw' | 'leaderboard' | 'profile';

export default function DashboardClient() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [todayCard, setTodayCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [globalRank, setGlobalRank] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [prevAttributes, setPrevAttributes] = useState<UserAttributes | null>(null);
  const [streakMessage, setStreakMessage] = useState('');

  const loadUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) { router.push('/login'); return; }

    const attributes: UserAttributes = {
      luck: profile.luck ?? 50,
      wealth: profile.wealth ?? 50,
      love: profile.love ?? 50,
      career: profile.career ?? 50,
      energy: profile.energy ?? 50,
    };

    const userData: User = {
      id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      attributes,
      spirit_score: calculateSpiritScore(attributes),
      aura_tier: getAuraTier(calculateSpiritScore(attributes)),
      daily_streak: profile.daily_streak ?? 0,
      longest_streak: profile.longest_streak ?? 0,
      last_draw_date: profile.last_draw_date,
      badges: profile.badges ?? [],
      created_at: profile.created_at,
    };

    setUser(userData);

    // Load today's drawn card if any
    if (profile.last_draw_date) {
      const lastDate = new Date(profile.last_draw_date);
      const today = new Date();
      if (lastDate.toDateString() === today.toDateString()) {
        // Get last draw
        const { data: lastDraw } = await supabase
          .from('draw_history')
          .select('*')
          .eq('user_id', authUser.id)
          .order('drawn_at', { ascending: false })
          .limit(1)
          .single();

        if (lastDraw) {
          const card = getCardById(lastDraw.card_id);
          if (card) {
            setTodayCard(card);
            setIsFlipped(true);
          }
        }
      }
    }

    // Get rank
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('spirit_score', userData.spirit_score);

    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    setGlobalRank((count ?? 0) + 1);
    setTotalUsers(total ?? 1);

    // Load draw history
    const { data: history } = await supabase
      .from('draw_history')
      .select('*')
      .eq('user_id', authUser.id)
      .order('drawn_at', { ascending: false })
      .limit(7);

    setDrawHistory(history ?? []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleDraw = async () => {
    if (!user || isDrawing) return;
    if (!isNewDay(user.last_draw_date)) return;

    setIsDrawing(true);

    const card = getRandomCard();
    const oldAttributes = { ...user.attributes };
    const newAttributes = applyAttributeEffects(user.attributes, card.attribute_effects);
    const newScore = calculateSpiritScore(newAttributes);
    const newTier = getAuraTier(newScore);

    // Check streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastDraw = user.last_draw_date ? new Date(user.last_draw_date) : null;
    const isConsecutive = lastDraw && lastDraw.toDateString() === yesterday.toDateString();
    const newStreak = isConsecutive ? user.daily_streak + 1 : 1;
    const newLongest = Math.max(user.longest_streak, newStreak);

    // Apply streak reward
    const streakReward = getStreakReward(newStreak);
    if (streakReward) {
      newAttributes[streakReward.attribute] = Math.min(100,
        newAttributes[streakReward.attribute] + streakReward.amount);
      setStreakMessage(`🔥 ${newStreak}-day streak! +${streakReward.amount} ${streakReward.attribute}!`);
      setTimeout(() => setStreakMessage(''), 5000);
    }

    // Check for 30-day badge
    const badges = [...(user.badges ?? [])];
    if (newStreak === 30 && !badges.find(b => b.id === '30day')) {
      badges.push({
        id: '30day',
        name: 'Eternal Flame',
        emoji: '🏅',
        description: '30-day streak achieved',
        earned_at: new Date().toISOString(),
      });
    }

    // Update DB
    const today = new Date().toISOString().split('T')[0];
    const { data: { user: authUser } } = await supabase.auth.getUser();

    await supabase.from('profiles').update({
      luck: newAttributes.luck,
      wealth: newAttributes.wealth,
      love: newAttributes.love,
      career: newAttributes.career,
      energy: newAttributes.energy,
      spirit_score: newScore,
      aura_tier: newTier,
      daily_streak: newStreak,
      longest_streak: newLongest,
      last_draw_date: today,
      badges,
    }).eq('id', authUser!.id);

    await supabase.from('draw_history').insert({
      user_id: authUser!.id,
      card_id: card.id,
      card_name: card.name,
      attribute_changes: card.attribute_effects,
      spirit_score_before: user.spirit_score,
      spirit_score_after: newScore,
    });

    setPrevAttributes(oldAttributes);
    setTodayCard(card);
    setUser(prev => prev ? {
      ...prev,
      attributes: newAttributes,
      spirit_score: newScore,
      aura_tier: newTier,
      daily_streak: newStreak,
      longest_streak: newLongest,
      last_draw_date: today,
      badges,
    } : null);

    // Animate flip
    setTimeout(() => setIsFlipped(true), 300);
    setIsDrawing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-float mb-4">✦</div>
          <p className="font-cinzel text-oracle-gold/60 animate-pulse">Reading your aura...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canDraw = isNewDay(user.last_draw_date);
  const topPct = getTopPercentage(globalRank, totalUsers);
  const tierColor = getTierColor(user.aura_tier);

  const shareData: ShareCardData = {
    username: user.username,
    aura_tier: user.aura_tier,
    spirit_score: user.spirit_score,
    global_rank: globalRank,
    total_users: totalUsers,
    top_percentage: topPct,
    today_card: todayCard,
    attributes: user.attributes,
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="fixed inset-0 stars-bg opacity-40 pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(10,6,24,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(123,47,190,0.2)' }}>
        <div className="font-cinzel font-black text-base">
          <span className="gold-text">SPIRIT</span>
          <span className="text-oracle-light"> STATUS</span>
        </div>
        <div className="flex items-center gap-3">
          {user.daily_streak >= 3 && (
            <span className="text-sm">🔥 {user.daily_streak}</span>
          )}
          <button onClick={handleSignOut} className="text-oracle-light/40 hover:text-oracle-light/70 text-sm transition-colors">
            Exit
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 relative z-10">
        {/* Streak message toast */}
        {streakMessage && (
          <div className="mb-4 py-3 px-4 rounded-xl text-center text-sm font-cinzel animate-card-reveal"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#E8D5A3' }}>
            {streakMessage}
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Aura hero */}
            <div className="spirit-card rounded-3xl p-6 text-center"
              style={{ boxShadow: `0 0 40px ${tierColor}20` }}>
              <div className="flex justify-center mb-4">
                <AuraRing tier={user.aura_tier} size={120}>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center font-cinzel font-black text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`,
                      color: tierColor,
                    }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </AuraRing>
              </div>

              <h2 className="font-cinzel font-bold text-oracle-light text-lg">{user.username}</h2>
              <div className="mt-2 mb-3"><TierBadge tier={user.aura_tier} size="md" /></div>

              <div className="font-mono font-black text-4xl gold-text mb-1">
                {formatScore(user.spirit_score)}
              </div>
              <div className="text-oracle-light/50 text-xs font-cinzel tracking-wider">SPIRIT SCORE</div>

              {/* Rank pills */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="text-center">
                  <div className="font-mono font-bold text-oracle-gold text-lg">
                    #{globalRank}<span className="text-xs text-oracle-gold/60">{getRankSuffix(globalRank)}</span>
                  </div>
                  <div className="text-oracle-light/40 text-xs font-cinzel">Global</div>
                </div>
                <div className="w-px bg-oracle-gold/20" />
                <div className="text-center">
                  <div className="font-mono font-bold text-oracle-gold text-lg">Top {topPct}%</div>
                  <div className="text-oracle-light/40 text-xs font-cinzel">Percentile</div>
                </div>
                <div className="w-px bg-oracle-gold/20" />
                <div className="text-center">
                  <div className="font-mono font-bold text-oracle-gold text-lg">🔥 {user.daily_streak}</div>
                  <div className="text-oracle-light/40 text-xs font-cinzel">Streak</div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="spirit-card rounded-2xl p-5">
              <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-4">ATTRIBUTES</h3>
              <div className="space-y-3">
                {(Object.keys(user.attributes) as (keyof UserAttributes)[]).map(attr => (
                  <AttributeBar
                    key={attr}
                    attribute={attr}
                    value={user.attributes[attr]}
                    previousValue={prevAttributes?.[attr]}
                    showChange={!!prevAttributes}
                  />
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div className="spirit-card rounded-2xl p-5">
              <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-2 text-center">SPIRIT MAP</h3>
              <SpiritRadarChart attributes={user.attributes} size={260} />
            </div>

            {/* Streak */}
            <StreakDisplay streak={user.daily_streak} longestStreak={user.longest_streak} />

            {/* Today's card preview if drawn */}
            {todayCard && (
              <DailyExtras card={todayCard} />
            )}

            {/* Quick draw CTA */}
            {canDraw && (
              <button
                onClick={() => setActiveTab('draw')}
                className="w-full py-4 rounded-2xl font-cinzel font-bold text-sm tracking-wider transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #7B2FBE, #C9A84C)',
                  color: 'white',
                  boxShadow: '0 0 30px rgba(123,47,190,0.4)',
                }}
              >
                ✦ Draw Today&apos;s Card ✦
              </button>
            )}

            {/* Share button */}
            <button
              onClick={() => setShowShare(true)}
              className="w-full py-3.5 rounded-2xl font-cinzel text-sm tracking-wider text-oracle-light/70 hover:text-oracle-light transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              📤 Share Your Aura
            </button>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="spirit-card rounded-2xl p-4">
                <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-3">BADGES</h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#E8D5A3' }}>
                      <span>{badge.emoji}</span>
                      <span className="font-cinzel">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draw history */}
            {drawHistory.length > 0 && (
              <div className="spirit-card rounded-2xl p-4">
                <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-3">RECENT DRAWS</h3>
                <div className="space-y-2">
                  {drawHistory.slice(0, 5).map(record => {
                    const card = getCardById(record.card_id);
                    return (
                      <div key={record.id} className="flex items-center justify-between py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{card?.emoji ?? '🃏'}</span>
                          <div>
                            <div className="text-sm text-oracle-light font-medium">{record.card_name}</div>
                            <div className="text-xs text-oracle-light/40">
                              {new Date(record.drawn_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-sm text-oracle-gold">
                          {record.spirit_score_after?.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DRAW TAB */}
        {activeTab === 'draw' && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="font-cinzel font-bold text-oracle-light text-xl mb-1">Daily Draw</h2>
              <p className="text-oracle-light/50 text-sm">
                {canDraw ? 'The cards await your call.' : 'Your card has been drawn today. Return at midnight.'}
              </p>
            </div>

            <div className="flex justify-center">
              <TarotCardDraw
                card={todayCard}
                isFlipped={isFlipped}
                onDraw={handleDraw}
                isLoading={isDrawing}
                canDraw={canDraw}
                alreadyDrawn={!canDraw}
              />
            </div>

            {/* Show attribute changes after draw */}
            {isFlipped && todayCard && prevAttributes && (
              <div className="spirit-card rounded-2xl p-5 animate-card-reveal">
                <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-4 text-center">
                  ATTRIBUTE CHANGES
                </h3>
                <div className="space-y-3">
                  {(Object.keys(user.attributes) as (keyof UserAttributes)[]).map(attr => (
                    <AttributeBar
                      key={attr}
                      attribute={attr}
                      value={user.attributes[attr]}
                      previousValue={prevAttributes[attr]}
                      showChange
                    />
                  ))}
                </div>
              </div>
            )}

            {isFlipped && todayCard && (
              <DailyExtras card={todayCard} />
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="py-4">
            <h2 className="font-cinzel font-bold text-oracle-light text-xl mb-1 text-center">Rankings</h2>
            <p className="text-oracle-light/40 text-sm text-center mb-6">Compete across all dimensions</p>
            <LeaderboardWidget userId={user.id} />
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <AuraRing tier={user.aura_tier} size={100} className="mx-auto mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-cinzel font-black text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}10)`,
                    color: tierColor,
                  }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </AuraRing>
              <h2 className="font-cinzel font-bold text-oracle-light text-lg">{user.username}</h2>
              <p className="text-oracle-light/40 text-xs mt-1">
                Spirit since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-2 flex justify-center">
                <TierBadge tier={user.aura_tier} size="md" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Spirit Score', value: formatScore(user.spirit_score), emoji: '✨' },
                { label: 'Global Rank', value: `#${globalRank}`, emoji: '🌍' },
                { label: 'Best Streak', value: `${user.longest_streak} days`, emoji: '🔥' },
                { label: 'Total Draws', value: drawHistory.length.toString(), emoji: '🃏' },
              ].map(stat => (
                <div key={stat.label} className="spirit-card rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <div className="font-mono font-bold text-oracle-gold text-lg">{stat.value}</div>
                  <div className="text-oracle-light/40 text-xs font-cinzel">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="spirit-card rounded-2xl p-4 text-center">
              <p className="text-oracle-light/50 text-xs mb-2 font-cinzel">PUBLIC PROFILE URL</p>
              <p className="text-oracle-gold font-mono text-sm">spirit-status.app/u/{user.username}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl font-cinzel text-sm text-oracle-light/40 hover:text-oracle-light/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{
          background: 'rgba(10,6,24,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(123,47,190,0.2)',
        }}>
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {([
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'draw', icon: '🃏', label: 'Draw', badge: canDraw },
            { id: 'leaderboard', icon: '🏆', label: 'Ranks' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 relative"
              style={activeTab === tab.id ? {
                background: 'rgba(123,47,190,0.2)',
              } : {}}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-xs font-cinzel tracking-wide ${activeTab === tab.id ? 'text-oracle-gold' : 'text-oracle-light/40'}`}>
                {tab.label}
              </span>
              {'badge' in tab && tab.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-oracle-gold animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Share modal */}
      {showShare && (
        <ShareCard data={shareData} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

// Inline leaderboard widget for dashboard
function LeaderboardWidget({ userId }: { userId: string }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const Leaderboard = require('@/components/leaderboard/Leaderboard').default;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('leaderboard_spirit')
        .select('*')
        .limit(50);

      if (data) {
        setEntries(data.map((row: any) => ({
          rank: row.rank,
          user_id: row.user_id,
          username: row.username,
          avatar_url: row.avatar_url,
          spirit_score: row.spirit_score,
          aura_tier: row.aura_tier,
          daily_streak: row.daily_streak,
          attributes: {
            luck: row.luck,
            wealth: row.wealth,
            love: row.love,
            career: row.career,
            energy: row.energy,
          },
        })));
      }
      setLoading(false);
    })();
  }, [supabase]);

  return <Leaderboard entries={entries} currentUserId={userId} isLoading={loading} />;
}
