'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateSpiritScore, getAuraTier, applyAttributeEffects, isNewDay, getStreakBonus, getTierColor, getTierBg, getTierLabel, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import { getRandomCard, getCardById } from '@/lib/tarot';
import type { User, TarotCard, UserAttributes } from '@/types';
import HomeTab from './tabs/HomeTab';
import DrawTab from './tabs/DrawTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import FriendsTab from './tabs/FriendsTab';
import ProfileTab from './tabs/ProfileTab';

export type Tab = 'home' | 'draw' | 'leaderboard' | 'friends' | 'profile';

export default function DashboardClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('home');
  const [todayCard, setTodayCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [globalRank, setGlobalRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(1);
  const [prevAttrs, setPrevAttrs] = useState<UserAttributes | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const loadUser = useCallback(async () => {
    const { data: { user: auth } } = await supabase.auth.getUser();
    if (!auth) { router.push('/login'); return; }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', auth.id).single();
    if (!p) { router.push('/login'); return; }

    const attrs: UserAttributes = { luck: p.luck??50, wealth: p.wealth??50, love: p.love??50, career: p.career??50, energy: p.energy??50 };
    const score = calculateSpiritScore(attrs);
    const userData: User = {
      id: p.id, username: p.username, avatar_url: p.avatar_url, attributes: attrs,
      spirit_score: score, aura_tier: getAuraTier(score),
      daily_streak: p.daily_streak??0, longest_streak: p.longest_streak??0,
      last_draw_date: p.last_draw_date, badges: p.badges??[], created_at: p.created_at,
    };
    setUser(userData);

    // Load today's card if already drawn
    if (p.last_draw_date) {
      const last = new Date(p.last_draw_date);
      if (last.toDateString() === new Date().toDateString()) {
        const { data: d } = await supabase.from('draw_history').select('*').eq('user_id', auth.id).order('drawn_at',{ascending:false}).limit(1).single();
        if (d) { const c = getCardById(d.card_id); if (c) { setTodayCard(c); setIsFlipped(true); } }
      }
    }

    const { count: rc } = await supabase.from('profiles').select('*',{count:'exact',head:true}).gt('spirit_score', score);
    const { count: tc } = await supabase.from('profiles').select('*',{count:'exact',head:true});
    setGlobalRank((rc??0)+1); setTotalUsers(tc??1);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleDraw = async () => {
    if (!user || isDrawing || !isNewDay(user.last_draw_date)) return;
    setIsDrawing(true);
    const card = getRandomCard();
    const oldAttrs = { ...user.attributes };
    let newAttrs = applyAttributeEffects(user.attributes, card.attribute_effects);

    // Streak logic
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const lastDraw = user.last_draw_date ? new Date(user.last_draw_date) : null;
    const isConsec = lastDraw && lastDraw.toDateString() === yesterday.toDateString();
    const newStreak = isConsec ? user.daily_streak + 1 : 1;
    const newLongest = Math.max(user.longest_streak, newStreak);

    const bonus = getStreakBonus(newStreak);
    if (bonus) {
      newAttrs[bonus.attribute] = Math.min(100, newAttrs[bonus.attribute] + bonus.amount);
      showToast(`🔥 ${newStreak} วันติดต่อกัน! +${bonus.amount} ${ATTR_CONFIG[bonus.attribute].labelTh}`);
    }

    const newScore = calculateSpiritScore(newAttrs);
    const newTier = getAuraTier(newScore);
    const today = new Date().toISOString().split('T')[0];
    const badges = [...(user.badges??[])];
    if (newStreak === 30 && !badges.find(b => b.id === '30day')) {
      badges.push({ id:'30day', name:'เปลวเพลิงนิรันดร์', emoji:'🏅', description:'streak 30 วัน', earned_at: new Date().toISOString() });
    }

    const { data: { user: auth } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ luck:newAttrs.luck, wealth:newAttrs.wealth, love:newAttrs.love, career:newAttrs.career, energy:newAttrs.energy, spirit_score:newScore, aura_tier:newTier, daily_streak:newStreak, longest_streak:newLongest, last_draw_date:today, badges }).eq('id', auth!.id);
    await supabase.from('draw_history').insert({ user_id:auth!.id, card_id:card.id, card_name:card.name, attribute_changes:card.attribute_effects, spirit_score_before:user.spirit_score, spirit_score_after:newScore });

    setPrevAttrs(oldAttrs);
    setTodayCard(card);
    setUser(prev => prev ? { ...prev, attributes:newAttrs, spirit_score:newScore, aura_tier:newTier, daily_streak:newStreak, longest_streak:newLongest, last_draw_date:today, badges } : null);
    setTimeout(() => setIsFlipped(true), 400);
    setIsDrawing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7FF' }}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-float">✨</div>
        <p className="font-semibold animate-pulse-soft" style={{ color: '#7C3AED' }}>กำลังโหลดพลังงานของคุณ...</p>
      </div>
    </div>
  );
  if (!user) return null;

  const canDraw = isNewDay(user.last_draw_date);
  const tierColor = getTierColor(user.aura_tier);

  const tabProps = { user, globalRank, totalUsers, todayCard, isFlipped, isDrawing, canDraw, prevAttrs, onDraw: handleDraw, showToast };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F8F7FF' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg animate-scaleIn"
          style={{ background: 'white', color: '#1E1B4B', border: '1px solid #EDE9FE', boxShadow: '0 8px 30px rgba(124,58,237,0.15)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(248,247,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-bold" style={{ color: '#1E1B4B' }}>Spirit Status</span>
        </div>
        <div className="flex items-center gap-2">
          {canDraw && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse-soft"
              style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              จั่วไพ่ได้แล้ว!
            </span>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: getTierBg(user.aura_tier), color: tierColor }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {tab === 'home' && <HomeTab {...tabProps} />}
        {tab === 'draw' && <DrawTab {...tabProps} />}
        {tab === 'leaderboard' && <LeaderboardTab {...tabProps} />}
        {tab === 'friends' && <FriendsTab {...tabProps} />}
        {tab === 'profile' && <ProfileTab {...tabProps} />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
          {([
            { id:'home', icon:'🏠', label:'หน้าหลัก' },
            { id:'draw', icon:'🃏', label:'จั่วไพ่', badge: canDraw },
            { id:'leaderboard', icon:'🏆', label:'อันดับ' },
            { id:'friends', icon:'👥', label:'เพื่อน' },
            { id:'profile', icon:'👤', label:'โปรไฟล์' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative"
              style={tab === t.id ? { background: '#EDE9FE' } : {}}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-medium" style={{ color: tab === t.id ? '#7C3AED' : '#9CA3AF' }}>{t.label}</span>
              {'badge' in t && t.badge && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full" style={{ background: '#7C3AED' }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
