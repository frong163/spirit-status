'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MAJOR_ARCANA } from '@/lib/tarot';
import { ATTR_CONFIG } from '@/lib/game';
import type { UserAttributes } from '@/types';

const DEMO_ATTRS = { luck:78, wealth:85, love:60, career:72, energy:90 };

export default function HomePage() {
  const [card, setCard] = useState(MAJOR_ARCANA[19]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { setCard(MAJOR_ARCANA[Math.floor(Math.random()*22)]); setTick(p=>p+1); }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen pb-8" style={{background:'linear-gradient(180deg,#F5F3FF 0%,#EDE9FE 40%,#F5F3FF 100%)'}}>
      <div className="max-w-md mx-auto px-4 pt-10">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',boxShadow:'0 4px 12px rgba(124,58,237,.4)'}}>✨</div>
          <div>
            <div className="font-black text-lg" style={{color:'#18181B',lineHeight:1}}>Spirit Status</div>
            <div className="text-xs font-medium" style={{color:'#7C3AED'}}>พลังงานดี ชีวิตดีขึ้น</div>
          </div>
        </div>

        {/* Hero text */}
        <h1 className="font-black mb-3" style={{fontSize:32,color:'#18181B',lineHeight:1.25}}>
          เช็กพลังงานวันนี้<br/>
          <span style={{color:'#7C3AED'}}>รับพลังดีทุกวัน 🌟</span>
        </h1>
        <p className="text-base mb-8" style={{color:'#71717A',lineHeight:1.6}}>
          จั่วไพ่ทาโรต์วันละ 1 ครั้ง · ปรับพลังงาน 5 ด้าน<br/>แข่งขัน Leaderboard กับผู้เล่นทั่วโลก
        </p>

        {/* Live tarot preview */}
        <div className="tarot p-5 mb-6 anim-scalein" key={tick} style={{borderRadius:24}}>
          <div className="tarot-pattern"/>
          <div className="relative z-10">
            <div className="text-xs font-bold mb-3 tracking-widest" style={{color:'rgba(245,158,11,.7)'}}>✦ พลังงานตัวอย่าง ✦</div>
            <div className="flex items-center gap-4">
              <div className="text-6xl anim-float">{card.emoji}</div>
              <div className="flex-1">
                <div className="font-black text-xl mb-1" style={{color:'#F5F3FF'}}>{card.name}</div>
                <div className="text-xs mb-3" style={{color:'rgba(245,243,255,.55)',lineHeight:1.5}}>{card.affirmation}</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.attribute_effects).slice(0,2).map(([k,v])=>{
                    const c = ATTR_CONFIG[k as keyof UserAttributes];
                    return <span key={k} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(255,255,255,.12)',color:'#E9D5FF'}}>+{v} {c.labelTh}</span>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attr preview */}
        <div className="card p-5 mb-6">
          <div className="font-bold text-sm mb-4" style={{color:'#18181B'}}>สถานะพลังงาน 5 ด้าน</div>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(DEMO_ATTRS) as [keyof UserAttributes,number][]).map(([k,v])=>{
              const c = ATTR_CONFIG[k];
              return (
                <div key={k} className="attr-card text-center" style={{background:c.bg}}>
                  <div className="text-2xl">{c.emoji}</div>
                  <div className="font-black text-lg" style={{color:c.color,lineHeight:1}}>{v}</div>
                  <div className="text-xs font-semibold" style={{color:c.color,opacity:.7}}>{c.labelTh}</div>
                  <div className="pbar mt-1"><div className={`pbar-fill pb-${k}`} style={{width:`${v}%`}}/></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            {icon:'🃏',t:'จั่วไพ่วันละครั้ง',d:'ไพ่ 22 ใบ ผลต่างกัน'},
            {icon:'🏆',t:'Leaderboard โลก',d:'แข่ง 6 หมวด'},
            {icon:'👥',t:'ระบบเพื่อน',d:'เช็กสถานะกัน'},
            {icon:'🔥',t:'Streak รายวัน',d:'โบนัสพลังงาน'},
          ].map((f,i)=>(
            <div key={i} className="card p-4 anim-fadeup" style={{animationDelay:`${i*.08}s`}}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-bold text-sm mb-0.5" style={{color:'#18181B'}}>{f.t}</div>
              <div className="text-xs" style={{color:'#A1A1AA'}}>{f.d}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/login?mode=signup">
          <button className="btn btn-primary mb-3" style={{fontSize:17}}>✨ เริ่มต้นฟรี — จั่วไพ่วันนี้</button>
        </Link>
        <Link href="/login" className="block text-center font-semibold text-sm py-3" style={{color:'#7C3AED'}}>
          มีบัญชีแล้ว? เข้าสู่ระบบ →
        </Link>
      </div>
    </main>
  );
}
