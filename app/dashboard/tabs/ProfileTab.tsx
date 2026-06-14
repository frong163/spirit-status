'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierLabel, getTierEmoji, getRankSuffix, getTopPercentage, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';

export default function ProfileTab({ user, globalRank, totalUsers, todayCard, showToast }: TabProps) {
  const router = useRouter();
  const supabase = createClient();
  const tc = getTierColor(user.aura_tier);
  const topPct = getTopPercentage(globalRank, totalUsers);

  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const shareText = `✨ Spirit Status วันนี้\n${user.aura_tier} — ${user.spirit_score.toFixed(1)} pts\n🌍 อันดับ #${globalRank} Top ${topPct}%\n${todayCard?`🃏 ${todayCard.name}`:''}`;

  const share = async (p:string) => {
    if (p==='copy') { await navigator.clipboard.writeText(shareText); showToast('📋 คัดลอกแล้ว!'); return; }
    if (p==='line') window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(shareText)}`,'_blank');
    if (p==='x') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,'_blank');
    if (p==='fb') window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`,'_blank');
  };

  return (
    <div className="pb-nav space-y-4 anim-fadeup">
      <div className="pt-2">
        <div className="text-2xl font-black" style={{color:'#18181B'}}>โปรไฟล์ 👤</div>
      </div>

      {/* Profile hero */}
      <div className="card p-6 text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div style={{position:'absolute',inset:-8,borderRadius:'50%',background:`radial-gradient(circle,${tc}25,transparent 70%)`,filter:'blur(6px)'}}/>
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center font-black text-3xl"
            style={{background:`${tc}15`,border:`3px solid ${tc}`,color:tc,boxShadow:`0 0 24px ${tc}30`}}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="font-black text-xl" style={{color:'#18181B'}}>{user.username}</div>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span>{getTierEmoji(user.aura_tier)}</span>
          <span className="font-bold text-sm" style={{color:tc}}>{user.aura_tier}</span>
          <span className="text-sm" style={{color:'#A1A1AA'}}>• {getTierLabel(user.aura_tier)}</span>
        </div>
        <div className="font-black mt-3" style={{fontSize:44,color:'#7C3AED',lineHeight:1}}>{user.spirit_score.toFixed(1)}</div>
        <div className="text-xs mt-0.5" style={{color:'#A1A1AA'}}>Spirit Score</div>

        <div className="flex mt-5 pt-4" style={{borderTop:'1px solid #F4F4F5'}}>
          {[
            {label:'อันดับ',val:`#${globalRank}${getRankSuffix(globalRank)}`},
            {label:'Top',val:`${topPct}%`},
            {label:'Streak',val:`🔥 ${user.daily_streak}`},
          ].map((s,i)=>(
            <div key={i} className="flex-1 text-center">
              <div className="font-black text-lg" style={{color:'#7C3AED'}}>{s.val}</div>
              <div className="text-xs" style={{color:'#A1A1AA'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="card p-5">
        <div className="font-black text-base mb-4" style={{color:'#18181B'}}>สถานะพลังงาน</div>
        <div className="space-y-3.5">
          {(Object.entries(user.attributes) as [keyof UserAttributes,number][]).map(([k,v])=>{
            const c = ATTR_CONFIG[k];
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm flex items-center gap-1.5" style={{color:c.color}}>{c.emoji} {c.labelTh}</span>
                  <span className="font-black text-sm" style={{color:c.color}}>{v}<span className="font-normal text-xs" style={{color:'#A1A1AA'}}>/100</span></span>
                </div>
                <div className="pbar"><div className={`pbar-fill pb-${k}`} style={{width:`${v}%`}}/></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {user.badges.length>0 && (
        <div className="card p-5">
          <div className="font-black text-base mb-3" style={{color:'#18181B'}}>ป้ายรางวัล 🏅</div>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b:any)=>(
              <div key={b.id} className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold" style={{background:'#FEF3C7',color:'#D97706'}}>
                {b.emoji} {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="card p-5">
        <div className="font-black text-base mb-4" style={{color:'#18181B'}}>แชร์สถานะ 📤</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {id:'line',label:'LINE',color:'#06C755',emoji:'💬'},
            {id:'x',label:'X (Twitter)',color:'#000',emoji:'𝕏'},
            {id:'fb',label:'Facebook',color:'#1877F2',emoji:'📘'},
            {id:'copy',label:'คัดลอก',color:'#52525B',emoji:'📋'},
          ].map(p=>(
            <button key={p.id} onClick={()=>share(p.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
              style={{background:p.color}}>
              <span>{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-2xl flex items-center justify-between" style={{background:'#F5F3FF'}}>
          <div>
            <div className="text-xs" style={{color:'#A1A1AA'}}>ลิงก์โปรไฟล์สาธารณะ</div>
            <div className="text-sm font-bold mt-0.5" style={{color:'#7C3AED'}}>/u/{user.username}</div>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);showToast('📋 คัดลอกแล้ว!');}}
            className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{background:'white',color:'#7C3AED',boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
            คัดลอก
          </button>
        </div>
      </div>

      <button onClick={signOut} className="btn btn-ghost">ออกจากระบบ</button>
    </div>
  );
}
