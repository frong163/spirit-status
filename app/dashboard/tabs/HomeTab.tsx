'use client';
import { getTierColor, ATTR_CONFIG, getRankSuffix, getTopPercentage, getTierEmoji, getTierLabel } from '@/lib/game';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';

export default function HomeTab({ user, globalRank, totalUsers, todayCard, canDraw, onDraw }: TabProps) {
  const tc = getTierColor(user.aura_tier);
  const topPct = getTopPercentage(globalRank, totalUsers);
  const C = 2*Math.PI*44;
  const offset = C - (user.spirit_score/100)*C;

  return (
    <div className="pb-nav space-y-4 anim-fadeup">

      {/* Greeting */}
      <div className="pt-2">
        <div className="text-2xl font-black" style={{color:'#18181B'}}>สวัสดี {user.username} 👋</div>
        <div className="text-sm mt-0.5" style={{color:'#71717A'}}>เช็กพลังงานวันนี้ รับพลังดี ๆ</div>
      </div>

      {/* Hero spirit score card */}
      <div className="relative overflow-hidden" style={{
        background:'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)',
        borderRadius:24, padding:'24px 20px',
        boxShadow:'0 12px 40px rgba(124,58,237,.40)'
      }}>
        {/* BG decoration */}
        <div style={{position:'absolute',top:-30,right:-30,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.07)'}}/>
        <div style={{position:'absolute',bottom:-20,left:-20,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs font-bold mb-1 tracking-widest" style={{color:'rgba(255,255,255,.6)'}}>SPIRIT SCORE วันนี้</div>
            <div className="font-black" style={{fontSize:52,color:'white',lineHeight:1}}>{user.spirit_score.toFixed(1)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="tier-chip" style={{background:'rgba(255,255,255,.18)',color:'white',fontSize:13}}>
                {getTierEmoji(user.aura_tier)} {user.aura_tier}
              </span>
              <span className="text-xs" style={{color:'rgba(255,255,255,.55)'}}>{getTierLabel(user.aura_tier)}</span>
            </div>
          </div>

          {/* Ring */}
          <div style={{position:'relative',width:96,height:96,flexShrink:0}}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
              <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8"/>
              <circle cx="48" cy="48" r="44" fill="none" stroke="url(#rg)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                style={{transformOrigin:'center',transform:'rotate(-90deg)',transition:'stroke-dashoffset 1.2s ease'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div className="font-black text-xl" style={{color:'white',lineHeight:1}}>{Math.round(user.spirit_score)}%</div>
              <div className="text-xs" style={{color:'rgba(255,255,255,.5)'}}>Spirit</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-0 mt-5 pt-4" style={{borderTop:'1px solid rgba(255,255,255,.15)'}}>
          {[
            {label:'อันดับโลก', val:`#${globalRank}${getRankSuffix(globalRank)}`},
            {label:'Top', val:`${topPct}%`},
            {label:'Streak', val:`🔥 ${user.daily_streak}`},
          ].map((s,i)=>(
            <div key={i} className="flex-1 text-center">
              <div className="font-black text-lg" style={{color:'white'}}>{s.val}</div>
              <div className="text-xs" style={{color:'rgba(255,255,255,.5)'}}>{s.label}</div>
              {i<2 && <div style={{position:'absolute'}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Attributes grid */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-black text-base" style={{color:'#18181B'}}>พลังงานของคุณ</div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'#EDE9FE',color:'#7C3AED'}}>
            อัพเดทวันนี้
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(user.attributes) as [keyof UserAttributes,number][]).map(([k,v])=>{
            const c = ATTR_CONFIG[k];
            return (
              <div key={k} className="attr-card" style={{background:c.bg}}>
                <div className="text-2xl text-center">{c.emoji}</div>
                <div className="font-black text-xl text-center" style={{color:c.color,lineHeight:1.1}}>{v}</div>
                <div className="text-center" style={{fontSize:10,fontWeight:700,color:c.color,opacity:.75}}>{c.labelTh}</div>
                <div className="pbar" style={{marginTop:4}}>
                  <div className={`pbar-fill pb-${k}`} style={{width:`${v}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's card CTA */}
      <div className="card overflow-hidden">
        {todayCard ? (
          <div className="flex items-center gap-4 p-5">
            <div className="tarot flex items-center justify-center flex-shrink-0" style={{width:64,height:96,borderRadius:14}}>
              <div className="tarot-pattern"/>
              <span className="relative z-10 text-3xl anim-float">{todayCard.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold mb-1" style={{color:'#A1A1AA'}}>การ์ดวันนี้</div>
              <div className="font-black text-lg leading-tight" style={{color:'#18181B'}}>{todayCard.name}</div>
              <div className="text-sm mt-1 line-clamp-2" style={{color:'#71717A'}}>{todayCard.affirmation}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(todayCard.attribute_effects).map(([k,v])=>{
                  const c = ATTR_CONFIG[k as keyof UserAttributes];
                  return <span key={k} className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>+{v} {c.emoji}</span>;
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{background:'linear-gradient(135deg,#7C3AED,#5B21B6)',padding:'20px 20px'}}>
            <div className="flex items-center gap-4">
              <div className="tarot flex items-center justify-center flex-shrink-0" style={{width:64,height:96,borderRadius:14}}>
                <div className="tarot-pattern"/>
                <span className="relative z-10 text-3xl anim-float">🌙</span>
              </div>
              <div className="flex-1">
                <div className="font-black text-lg mb-1" style={{color:'white'}}>จั่วไพ่วันนี้!</div>
                <div className="text-sm mb-4" style={{color:'rgba(255,255,255,.7)'}}>ปรับพลังงาน 5 ด้านของคุณ รับโชคและคำทำนายประจำวัน</div>
                <button onClick={onDraw} className="btn btn-sm" style={{
                  background:'white',color:'#7C3AED',fontWeight:800,
                  width:'auto',padding:'10px 20px',boxShadow:'0 4px 12px rgba(0,0,0,.15)'
                }}>
                  ✨ จั่วไพ่เลย
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lucky today */}
      {todayCard && (
        <div className="card p-5">
          <div className="font-black text-base mb-4" style={{color:'#18181B'}}>ฤกษ์ดีวันนี้ ✨</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {emoji:'🔢',label:'เลขนำโชค',val:todayCard.lucky_number.toString()},
              {emoji:'🎨',label:'สีนำโชค',val:todayCard.lucky_color,hex:todayCard.lucky_color_hex},
              {emoji:'🧭',label:'ทิศมงคล',val:todayCard.lucky_direction},
            ].map(item=>(
              <div key={item.label} className="text-center p-3 rounded-2xl" style={{background:'#F5F3FF'}}>
                <div className="text-xl mb-1">{item.emoji}</div>
                {'hex' in item && <div className="w-5 h-5 rounded-full mx-auto mb-1 border-2 border-white shadow-sm" style={{background:item.hex}}/>}
                <div className="font-black text-sm leading-tight" style={{color:'#18181B'}}>{item.val}</div>
                <div className="text-xs mt-0.5" style={{color:'#A1A1AA'}}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-black text-base" style={{color:'#18181B'}}>Streak รายวัน 🔥</div>
          <div className="font-black text-2xl" style={{color:'#7C3AED'}}>{user.daily_streak}</div>
        </div>
        <div className="flex gap-1 mb-3">
          {Array.from({length:7}).map((_,i)=>(
            <div key={i} className="flex-1 rounded-full" style={{
              height:8,
              background: i<(user.daily_streak%7||(user.daily_streak>0&&user.daily_streak%7===0?7:0))
                ? 'linear-gradient(90deg,#F59E0B,#D97706)'
                : '#F4F4F5'
            }}/>
          ))}
        </div>
        <div className="text-xs" style={{color:'#A1A1AA'}}>
          {user.daily_streak<3 ? `อีก ${3-user.daily_streak} วัน → รับโบนัส +2 พลังงาน` :
           user.daily_streak<7 ? `อีก ${7-user.daily_streak} วัน → รับโบนัส +5 พลังงาน` :
           user.daily_streak<30? `อีก ${30-user.daily_streak} วัน → รับ Badge พิเศษ` : '🏅 คุณทำได้! Streak 30 วัน'}
        </div>
      </div>
    </div>
  );
}
