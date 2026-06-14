'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { AuraTier, UserAttributes } from '@/types';

type LBType = 'spirit'|keyof UserAttributes;
const TABS: {id:LBType;label:string;emoji:string}[] = [
  {id:'spirit',label:'Spirit',emoji:'✨'},
  {id:'luck',label:'โชค',emoji:'🍀'},
  {id:'wealth',label:'การเงิน',emoji:'💰'},
  {id:'love',label:'ความรัก',emoji:'❤️'},
  {id:'career',label:'การงาน',emoji:'💼'},
  {id:'energy',label:'พลังงาน',emoji:'⚡'},
];

export default function LeaderboardTab({ user }: TabProps) {
  const supabase = createClient();
  const [active, setActive] = useState<LBType>('spirit');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const view = active==='spirit'?'leaderboard_spirit':`leaderboard_${active}`;
      const {data} = await supabase.from(view).select('*').limit(50);
      setEntries(data??[]); setLoading(false);
    })();
  },[active]);

  const getVal = (e:any)=>active==='spirit'?parseFloat(e.spirit_score).toFixed(1):e[active];

  const top3 = entries.slice(0,3);
  const rest  = entries.slice(3);

  return (
    <div className="pb-nav space-y-4 anim-fadeup">
      <div className="pt-2">
        <div className="text-2xl font-black" style={{color:'#18181B'}}>อันดับ 🏆</div>
        <div className="text-sm mt-0.5" style={{color:'#71717A'}}>แข่งขันกับผู้เล่นทั่วโลก</div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-bold transition-all"
            style={active===t.id
              ? {background:'linear-gradient(135deg,#7C3AED,#6D28D9)',color:'white',boxShadow:'0 4px 12px rgba(124,58,237,.3)'}
              : {background:'white',color:'#71717A',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Podium top 3 */}
      {!loading && top3.length>=1 && (
        <div className="card p-5">
          <div className="flex items-end justify-center gap-4">
            {[1,0,2].map(i=>{
              if(!top3[i]) return <div key={i} className="w-20"/>;
              const e = top3[i];
              const tc = getTierColor(e.aura_tier as AuraTier);
              const isFirst = i===0;
              const heights = [72,56,44];
              const podiumH = heights[i];
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  {isFirst && <div className="text-2xl">👑</div>}
                  <div className="rounded-full flex items-center justify-center font-black"
                    style={{
                      width:isFirst?56:44,height:isFirst?56:44,
                      background:`${tc}20`,border:`2.5px solid ${tc}`,
                      color:tc,fontSize:isFirst?20:16,
                      boxShadow:isFirst?`0 0 20px ${tc}40`:undefined
                    }}>
                    {e.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs font-bold text-center max-w-[72px] truncate" style={{color:'#18181B'}}>{e.username}</div>
                  <div className="text-xs font-black" style={{color:'#7C3AED'}}>{getVal(e)}</div>
                  <div className="rounded-t-xl w-full flex items-center justify-center"
                    style={{
                      width:isFirst?72:56,height:podiumH,
                      background:isFirst?'#FEF3C7':i===1?'#F4F4F5':'#FEF9EE',
                      border:'1.5px solid',borderColor:isFirst?'#F59E0B':'#E4E4E7',
                    }}>
                    <span className="text-2xl">{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of list */}
      <div className="space-y-2">
        {loading ? Array.from({length:6}).map((_,i)=>(
          <div key={i} className="h-16 rounded-2xl anim-pulse" style={{background:'#F4F4F5'}}/>
        )) : rest.map((e,idx)=>{
          const isMe = e.user_id===user.id;
          const tc = getTierColor(e.aura_tier as AuraTier);
          return (
            <div key={e.user_id} className="card flex items-center gap-3 p-3.5"
              style={isMe?{border:'2px solid #7C3AED',background:'#FAF8FF'}:{}}>
              <div className="w-8 text-center font-black text-sm" style={{color:'#A1A1AA'}}>#{idx+4}</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{background:`${tc}18`,border:`2px solid ${tc}`,color:tc}}>
                {e.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm flex items-center gap-1.5 truncate" style={{color:'#18181B'}}>
                  {e.username}
                  {isMe && <span className="text-xs px-1.5 py-0.5 rounded-lg" style={{background:'#EDE9FE',color:'#7C3AED'}}>คุณ</span>}
                </div>
                <div className="text-xs flex items-center gap-1 mt-0.5" style={{color:'#A1A1AA'}}>
                  {getTierEmoji(e.aura_tier)} {e.aura_tier}
                  {e.daily_streak>=3&&<span>· 🔥{e.daily_streak}</span>}
                </div>
              </div>
              <div className="font-black text-base" style={{color:'#7C3AED'}}>{getVal(e)}</div>
            </div>
          );
        })}
        {!loading && entries.length===0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌌</div>
            <div className="font-bold" style={{color:'#A1A1AA'}}>ยังไม่มีผู้เล่น</div>
            <div className="text-sm mt-1" style={{color:'#D4D4D8'}}>เป็นคนแรกที่จั่วไพ่!</div>
          </div>
        )}
      </div>
    </div>
  );
}
