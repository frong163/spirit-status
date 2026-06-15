'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, CreditCard, Trophy, Users, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { calculateSpiritScore, getAuraTier, applyAttributeEffects, isNewDay, getStreakBonus, getTierColor, ATTR_CONFIG } from '@/lib/game';
import { getRandomCard, getCardById } from '@/lib/tarot';
import type { User as UserType, TarotCard, UserAttributes } from '@/types';
import HomeTab from './tabs/HomeTab';
import DrawTab from './tabs/DrawTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import FriendsTab from './tabs/FriendsTab';
import ProfileTab from './tabs/ProfileTab';

type Tab = 'home' | 'draw' | 'leaderboard' | 'friends' | 'profile';

const NAV: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'home',        label: 'หน้าหลัก', Icon: Home       },
  { id: 'draw',        label: 'จั่วไพ่',  Icon: CreditCard },
  { id: 'leaderboard', label: 'อันดับ',   Icon: Trophy     },
  { id: 'friends',     label: 'เพื่อน',   Icon: Users      },
  { id: 'profile',     label: 'โปรไฟล์',  Icon: User       },
];

export default function DashboardClient() {
  const router   = useRouter();
  const supabase = createClient();

  const [user, setUser]           = useState<UserType | null>(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>('home');
  const [todayCard, setTodayCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [globalRank, setGlobalRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(1);
  const [prevAttrs, setPrevAttrs] = useState<UserAttributes | null>(null);
  const [toast, setToast]         = useState('');
  const [toastShow, setToastShow] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg); setToastShow(true);
    setTimeout(() => setToastShow(false), 3200);
  };

  const loadUser = useCallback(async () => {
    const { data: { user: auth } } = await supabase.auth.getUser();
    if (!auth) { router.push('/login'); return; }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', auth.id).single();
    if (!p) { router.push('/login'); return; }

    const attrs: UserAttributes = { luck: p.luck ?? 50, wealth: p.wealth ?? 50, love: p.love ?? 50, career: p.career ?? 50, energy: p.energy ?? 50 };
    const score = calculateSpiritScore(attrs);

    setUser({
      id: p.id, username: p.username, avatar_url: p.avatar_url,
      attributes: attrs, spirit_score: score, aura_tier: getAuraTier(score),
      daily_streak: p.daily_streak ?? 0, longest_streak: p.longest_streak ?? 0,
      last_draw_date: p.last_draw_date, badges: p.badges ?? [], created_at: p.created_at,
    });

    // Load today's card if already drawn
    if (p.last_draw_date && new Date(p.last_draw_date).toDateString() === new Date().toDateString()) {
      const { data: d } = await supabase.from('draw_history').select('*').eq('user_id', auth.id).order('drawn_at', { ascending: false }).limit(1).single();
      if (d) { const c = getCardById(d.card_id); if (c) { setTodayCard(c); setIsFlipped(true); } }
    }

    const { count: rc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('spirit_score', score);
    const { count: tc } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setGlobalRank((rc ?? 0) + 1);
    setTotalUsers(tc ?? 1);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleDraw = async () => {
    if (!user || isDrawing || !isNewDay(user.last_draw_date)) return;
    setIsDrawing(true);

    const card      = getRandomCard();
    const oldAttrs  = { ...user.attributes };
    let newAttrs    = applyAttributeEffects(user.attributes, card.attribute_effects);

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const lastDraw  = user.last_draw_date ? new Date(user.last_draw_date) : null;
    const isConsec  = lastDraw && lastDraw.toDateString() === yesterday.toDateString();
    const newStreak = isConsec ? user.daily_streak + 1 : 1;
    const newLongest = Math.max(user.longest_streak, newStreak);

    const bonus = getStreakBonus(newStreak);
    if (bonus) {
      newAttrs[bonus.attribute] = Math.min(100, newAttrs[bonus.attribute] + bonus.amount);
    }

    const newScore = calculateSpiritScore(newAttrs);
    const newTier  = getAuraTier(newScore);
    const today    = new Date().toISOString().split('T')[0];
    const badges   = [...(user.badges ?? [])];

    if (newStreak === 30 && !badges.find(b => b.id === '30day')) {
      badges.push({ id: '30day', name: 'เปลวเพลิงนิรันดร์', emoji: '🏅', description: 'streak 30 วัน', earned_at: new Date().toISOString() });
    }

    const { data: { user: auth } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ luck: newAttrs.luck, wealth: newAttrs.wealth, love: newAttrs.love, career: newAttrs.career, energy: newAttrs.energy, spirit_score: newScore, aura_tier: newTier, daily_streak: newStreak, longest_streak: newLongest, last_draw_date: today, badges }).eq('id', auth!.id);
    await supabase.from('draw_history').insert({ user_id: auth!.id, card_id: card.id, card_name: card.name, attribute_changes: card.attribute_effects, spirit_score_before: user.spirit_score, spirit_score_after: newScore });

    setPrevAttrs(oldAttrs);
    setTodayCard(card);
    setUser(prev => prev ? { ...prev, attributes: newAttrs, spirit_score: newScore, aura_tier: newTier, daily_streak: newStreak, longest_streak: newLongest, last_draw_date: today, badges } : null);

    setTimeout(() => setIsFlipped(true), 500);
    setIsDrawing(false);

    if (bonus) showToast(`🔥 ${newStreak} วันติดต่อกัน! +${bonus.amount} ${ATTR_CONFIG[bonus.attribute].labelTh}`);
    else showToast(`✨ จั่วได้ ${card.name}!`);
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'floatY 3s ease-in-out infinite' }}>✨</div>
        <p style={{ fontWeight: 600, color: '#7C3AED', animation: 'pulseSoft 2s ease-in-out infinite', fontFamily: 'Noto Sans Thai,Inter,sans-serif' }}>
          กำลังโหลดพลังงานของคุณ...
        </p>
      </div>
    </div>
  );
  if (!user) return null;

  const canDraw  = isNewDay(user.last_draw_date);
  const tierColor = getTierColor(user.aura_tier);
  const tabProps  = { user, globalRank, totalUsers, todayCard, isFlipped, isDrawing, canDraw, prevAttrs, onDraw: handleDraw, showToast };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>

      {/* Toast */}
      <div style={{
        position: 'fixed', top: 20, left: '50%',
        transform: `translateX(-50%) translateY(${toastShow ? 0 : -80}px)`,
        zIndex: 200, background: 'white', borderRadius: 16,
        padding: '13px 20px', boxShadow: '0 8px 32px rgba(0,0,0,.13)',
        fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap',
        transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)',
        fontFamily: 'Noto Sans Thai,Inter,sans-serif', color: '#18181B',
      }}>
        {toast}
      </div>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(245,243,255,.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124,58,237,.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#18181B', fontFamily: 'Noto Sans Thai,Inter,sans-serif' }}>Spirit Status</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canDraw && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: '#EDE9FE', color: '#7C3AED', fontFamily: 'inherit', animation: 'pulseSoft 2s ease-in-out infinite' }}>
              จั่วไพ่ได้!
            </span>
          )}
          <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, background: `${tierColor}18`, border: `2px solid ${tierColor}`, color: tierColor }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 448, margin: '0 auto', padding: '16px 16px 0' }}>
        {tab === 'home'        && <HomeTab        {...tabProps} />}
        {tab === 'draw'        && <DrawTab        {...tabProps} />}
        {tab === 'leaderboard' && <LeaderboardTab {...tabProps} />}
        {tab === 'friends'     && <FriendsTab     {...tabProps} />}
        {tab === 'profile'     && <ProfileTab     {...tabProps} />}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'white', boxShadow: '0 -1px 0 rgba(0,0,0,.06), 0 -8px 24px rgba(0,0,0,.06)',
        paddingBottom: 'env(safe-area-inset-bottom,0)',
      }}>
        <div style={{ maxWidth: 448, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px' }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = tab === id;
            const isDraw = id === 'draw';
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, padding: '8px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: active ? '#EDE9FE' : 'transparent',
                  position: 'relative', transition: 'background .2s',
                  fontFamily: 'Noto Sans Thai,Inter,sans-serif',
                }}>
                {/* draw badge */}
                {isDraw && canDraw && (
                  <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', border: '2px solid white' }} />
                )}
                <span style={{ color: active ? '#7C3AED' : '#A1A1AA', display:'flex', alignItems:'center' }}><Icon size={22} /></span>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#7C3AED' : '#A1A1AA' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
