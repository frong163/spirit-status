'use client';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';
import { ATTR_CONFIG } from '@/lib/game';

export default function DrawTab({ user, todayCard, isFlipped, isDrawing, canDraw, prevAttrs, onDraw }: TabProps) {
  return (
    <div className="pb-nav space-y-5 anim-fadeup">
      <div className="pt-2">
        <div className="text-2xl font-black" style={{color:'#18181B'}}>การ์ดประจำวัน 🃏</div>
        <div className="text-sm mt-0.5" style={{color:'#71717A'}}>
          {canDraw ? 'ไพ่รอคุณอยู่ — จั่วได้ฟรี 1 ครั้ง/วัน' : 'คุณจั่วไพ่แล้ววันนี้ กลับมาพรุ่งนี้ 🌙'}
        </div>
      </div>

      {/* Card flip */}
      <div className="flex justify-center py-4">
        <div className="flip-scene" style={{width:200,height:320}}>
          <div className={`flip-card w-full h-full ${isFlipped?'flipped':''}`}>
            {/* Back */}
            <div className="flip-face tarot absolute inset-0 flex flex-col items-center justify-center" style={{borderRadius:20}}>
              <div className="tarot-pattern"/>
              <div className="absolute inset-3 rounded-2xl" style={{border:'1px solid rgba(245,158,11,.2)'}}/>
              <div className="absolute top-4 left-4 w-5 h-5" style={{borderTop:'2px solid rgba(245,158,11,.4)',borderLeft:'2px solid rgba(245,158,11,.4)'}}/>
              <div className="absolute top-4 right-4 w-5 h-5" style={{borderTop:'2px solid rgba(245,158,11,.4)',borderRight:'2px solid rgba(245,158,11,.4)'}}/>
              <div className="absolute bottom-4 left-4 w-5 h-5" style={{borderBottom:'2px solid rgba(245,158,11,.4)',borderLeft:'2px solid rgba(245,158,11,.4)'}}/>
              <div className="absolute bottom-4 right-4 w-5 h-5" style={{borderBottom:'2px solid rgba(245,158,11,.4)',borderRight:'2px solid rgba(245,158,11,.4)'}}/>
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-3 anim-float">🌙</div>
                <div className="text-xs font-bold tracking-widest" style={{color:'rgba(245,158,11,.5)'}}>SPIRIT STATUS</div>
              </div>
            </div>
            {/* Front */}
            <div className="flip-face flip-back tarot absolute inset-0 flex flex-col justify-between p-5" style={{borderRadius:20}}>
              {todayCard && <>
                <div className="tarot-pattern"/>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-mono" style={{color:'rgba(245,158,11,.5)'}}>{String(todayCard.id).padStart(2,'0')}</span>
                  <span style={{color:'rgba(245,158,11,.6)'}}>{todayCard.symbol}</span>
                </div>
                <div className="relative z-10 text-center">
                  <div className="text-6xl anim-float mb-3" style={{filter:'drop-shadow(0 0 16px rgba(245,158,11,.3))'}}>{todayCard.emoji}</div>
                </div>
                <div className="relative z-10 text-center">
                  <div className="font-black text-lg mb-1" style={{color:'#F5F3FF'}}>{todayCard.name}</div>
                  <div className="text-xs mb-3 leading-relaxed" style={{color:'rgba(245,243,255,.55)'}}>{todayCard.affirmation}</div>
                  <div className="space-y-1.5">
                    {Object.entries(todayCard.attribute_effects).map(([k,v])=>{
                      const c = ATTR_CONFIG[k as keyof UserAttributes];
                      return (
                        <div key={k} className="flex items-center justify-between text-xs px-3 py-1 rounded-lg" style={{background:'rgba(255,255,255,.08)'}}>
                          <span style={{color:'rgba(255,255,255,.7)'}}>{c.emoji} {c.labelTh}</span>
                          <span className="font-black" style={{color:'#86EFAC'}}>+{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>
      </div>

      {/* Draw button */}
      {!isFlipped && (
        <button onClick={onDraw} disabled={!canDraw||isDrawing} className="btn btn-primary">
          {isDrawing
            ? <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white anim-spin-fast"/>กำลังอ่านดวงดาว...</>
            : canDraw ? '✨ จั่วไพ่วันนี้' : '🌙 กลับมาพรุ่งนี้'}
        </button>
      )}

      {/* Result after draw */}
      {isFlipped && todayCard && (
        <div className="anim-slideup space-y-4">
          <div className="card p-5">
            <div className="font-black text-lg mb-1" style={{color:'#18181B'}}>{todayCard.name}</div>
            <div className="text-sm italic mb-4" style={{color:'#71717A'}}>"{todayCard.description}"</div>

            {prevAttrs && (
              <>
                <div className="font-bold text-sm mb-3" style={{color:'#18181B'}}>พลังงานที่เปลี่ยนแปลง</div>
                <div className="space-y-3">
                  {(Object.entries(user.attributes) as [keyof UserAttributes,number][]).map(([k,v])=>{
                    const c = ATTR_CONFIG[k];
                    const diff = v-(prevAttrs[k]);
                    return (
                      <div key={k}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold flex items-center gap-1.5" style={{color:c.color}}>{c.emoji} {c.labelTh}</span>
                          <div className="flex items-center gap-2">
                            {diff!==0 && <span className="text-xs font-black" style={{color:diff>0?'#16A34A':'#DC2626'}}>{diff>0?`+${diff}`:diff}</span>}
                            <span className="font-black text-sm" style={{color:c.color}}>{v}</span>
                          </div>
                        </div>
                        <div className="pbar"><div className={`pbar-fill pb-${k}`} style={{width:`${v}%`}}/></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Lucky */}
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
                  <div className="font-black text-sm" style={{color:'#18181B'}}>{item.val}</div>
                  <div className="text-xs mt-0.5" style={{color:'#A1A1AA'}}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
