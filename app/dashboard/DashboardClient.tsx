'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateSpiritScore, getAuraTier, applyAttributeEffects, isNewDay, getStreakBonus, getTierColor, ATTR_CONFIG } from '@/lib/game';
import { getRandomCard, getCardById } from '@/lib/tarot';
import type { User, TarotCard, UserAttributes } from '@/types';
import HomeTab from './tabs/HomeTab';
import DrawTab from './tabs/DrawTab';
import LeaderboardTab from './tabs/LeaderboardTab';
import FriendsTab from './tabs/FriendsTab';
import ProfileTab from './tabs/ProfileTab';

type Tab = 'home'|'draw'|'leaderboard'|'friends'|'profile';

export default function DashboardClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('home');
  const [todayCard, setTodayCard] = useState<TarotCard|null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [globalRank, setGlobalRank] = useState(0);
  const [totalUsers, setTotalUsers] = useState(1);
  const [prevAttrs, setPrevAttrs] = useState<UserAttributes|null>(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg:string) => {
    setToast(msg); setToastVisible(true);
    setTimeout(()=>setToastVisible(false), 3000);
  };

  const loadUser = useCallback(async()=>{
    const {data:{user:auth}} = await supabase.auth.getUser();
    if (!auth) { router.push('/login'); return; }
    const {data:p} = await supabase.from('profiles').select('*').eq('id',auth.id).single();
    if (!p) { router.push('/login'); return; }

    const attrs:UserAttributes = {luck:p.luck??50,wealth:p.wealth??50,love:p.love??50,career:p.career??50,energy:p.energy??50};
    const score = calculateSpiritScore(attrs);
    setUser({id:p.id,username:p.username,avatar_url:p.avatar_url,attributes:attrs,spirit_score:score,aura_tier:getAuraTier(score),daily_streak:p.daily_streak??0,longest_streak:p.longest_streak??0,last_draw_date:p.last_draw_date,badges:p.badges??[],created_at:p.created_at});

    if (p.last_draw_date && new Date(p.last_draw_date).toDateString()===new Date().toDateString()) {
      const {data:d} = await supabase.from('draw_history').select('*').eq('user_id',auth.id).order('drawn_at',{ascending:false}).limit(1).single();
      if (d) { const c=getCardById(d.card_id); if(c){setTodayCard(c);setIsFlipped(true);} }
    }
    const {count:rc} = await supabase.from('profiles').select('*',{count:'exact',head:true}).gt('spirit_score',score);
    const {count:tc} = await supabase.from('profiles').select('*',{count:'exact',head:true});
    setGlobalRank((rc??0)+1); setTotalUsers(tc??1);
    setLoading(false);
  },[supabase,router]);

  useEffect(()=>{loadUser();},[loadUser]);

  const handleDraw = async()=>{
    if(!user||isDrawing||!isNewDay(user.last_draw_date)) return;
    setIsDrawing(true);
    const card = getRandomCard();
    const oldAttrs = {...user.attributes};
    let newAttrs = applyAttributeEffects(user.attributes, card.attribute_effects);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const lastDraw = user.last_draw_date ? new Date(user.last_draw_date) : null;
    const isConsec = lastDraw && lastDraw.toDateString()===yesterday.toDateString();
    const newStreak = isConsec ? user.daily_streak+1 : 1;
    const newLongest = Math.max(user.longest_streak, newStreak);
    const bonus = getStreakBonus(newStreak);
    if (bonus) {
      newAttrs[bonus.attribute] = Math.min(100, newAttrs[bonus.attribute]+bonus.amount);
      showToast(`🔥 ${newStreak} วันติดต่อกัน! +${bonus.amount} ${ATTR_CONFIG[bonus.attribute].labelTh}`);
    }
    const newScore = calculateSpiritScore(newAttrs);
    const newTier = getAuraTier(newScore);
    const today = new Date().toISOString().split('T')[0];
    const badges = [...(user.badges??[])];
    if (newStreak===30 && !badges.find(b=>b.id==='30day')) badges.push({id:'30day',name:'เปลวเพลิงนิรันดร์',emoji:'🏅',description:'streak 30 วัน',earned_at:new Date().toISOString()});
    const {data:{user:auth}} = await supabase.auth.getUser();
    await supabase.from('profiles').update({luck:newAttrs.luck,wealth:newAttrs.wealth,love:newAttrs.love,career:newAttrs.career,energy:newAttrs.energy,spirit_score:newScore,aura_tier:newTier,daily_streak:newStreak,longest_streak:newLongest,last_draw_date:today,badges}).eq('id',auth!.id);
    await supabase.from('draw_history').insert({user_id:auth!.id,card_id:card.id,card_name:card.name,attribute_changes:card.attribute_effects,spirit_score_before:user.spirit_score,spirit_score_after:newScore});
    setPrevAttrs(oldAttrs);
    setTodayCard(card);
    setUser(prev=>prev?{...prev,attributes:newAttrs,spirit_score:newScore,aura_tier:newTier,daily_streak:newStreak,longest_streak:newLongest,last_draw_date:today,badges}:null);
    setTimeout(()=>setIsFlipped(true),500);
    setIsDrawing(false);
    if (!bonus) showToast(`✨ จั่วได้ ${card.name}!`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#F5F3FF'}}>
      <div className="text-center">
        <div className="text-5xl mb-4 anim-float">✨</div>
        <div className="font-bold anim-pulse" style={{color:'#7C3AED'}}>กำลังโหลดพลังงานของคุณ...</div>
      </div>
    </div>
  );
  if (!user) return null;

  const canDraw = isNewDay(user.last_draw_date);
  const tabProps = {user,globalRank,totalUsers,todayCard,isFlipped,isDrawing,canDraw,prevAttrs,onDraw:handleDraw,showToast};

  const NAV = [
    {id:'home' as Tab,icon:'🏠',label:'หน้าหลัก'},
    {id:'draw' as Tab,icon:'🃏',label:'จั่วไพ่',badge:canDraw},
    {id:'leaderboard' as Tab,icon:'🏆',label:'อันดับ'},
    {id:'friends' as Tab,icon:'👥',label:'เพื่อน'},
    {id:'profile' as Tab,icon:'👤',label:'โปรไฟล์'},
  ];

  return (
    <div className="min-h-screen" style={{background:'#F5F3FF'}}>
      {/* Toast */}
      <div className={`toast ${toastVisible?'show':''}`} style={{color:'#18181B'}}>
        {toast}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{background:'rgba(245,243,255,.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(124,58,237,.1)'}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)'}}>✨</div>
          <span className="font-black text-base" style={{color:'#18181B'}}>Spirit Status</span>
        </div>
        <div className="flex items-center gap-2">
          {canDraw && <span className="text-xs font-bold px-2.5 py-1 rounded-full anim-pulse" style={{background:'#EDE9FE',color:'#7C3AED'}}>จั่วไพ่ได้!</span>}
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
            style={{background:`${getTierColor(user.aura_tier)}18`,border:`2px solid ${getTierColor(user.aura_tier)}`,color:getTierColor(user.aura_tier)}}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pt-4">
        {tab==='home'        && <HomeTab        {...tabProps}/>}
        {tab==='draw'        && <DrawTab        {...tabProps}/>}
        {tab==='leaderboard' && <LeaderboardTab {...tabProps}/>}
        {tab==='friends'     && <FriendsTab     {...tabProps}/>}
        {tab==='profile'     && <ProfileTab     {...tabProps}/>}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1.5">
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} className={`nav-item ${tab===n.id?'active':''}`}>
              {'badge' in n && n.badge && <span className="nav-dot"/>}
              <span className="text-xl">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
