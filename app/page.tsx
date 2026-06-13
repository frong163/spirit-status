'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MAJOR_ARCANA } from '@/lib/tarot';

export default function HomePage() {
  const [card, setCard] = useState(MAJOR_ARCANA[19]);
  useEffect(() => {
    const t = setInterval(() => setCard(MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)]), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(160deg, #F8F7FF 0%, #EDE9FE 50%, #F8F7FF 100%)' }}>
      <div className="max-w-md mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <div className="font-bold text-lg" style={{ color: '#1E1B4B' }}>Spirit Status</div>
              <div className="text-xs" style={{ color: '#7C3AED' }}>พลังงานดี ชีวิตดีขึ้น</div>
            </div>
          </div>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-full" style={{ background: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED' }}>
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#1E1B4B', lineHeight: 1.3 }}>
            เช็กพลังงานวันนี้<br />
            <span style={{ color: '#7C3AED' }}>รับพลังดีทุกวัน</span>
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            จั่วไพ่ทาโรต์วันละครั้ง ปรับสถานะพลังงานของคุณ<br />แข่งขันบน Leaderboard โลก
          </p>
        </div>

        {/* Tarot preview card */}
        <div className="tarot-card mx-auto mb-8 p-6 text-center" style={{ maxWidth: 280 }}>
          <div className="text-xs mb-3" style={{ color: 'rgba(245,158,11,0.7)', letterSpacing: '0.15em' }}>พลังงานวันนี้</div>
          <div className="text-6xl mb-3 animate-float">{card.emoji}</div>
          <div className="font-bold text-lg mb-1" style={{ color: '#E8D5A3' }}>{card.name}</div>
          <div className="text-sm italic mb-4" style={{ color: 'rgba(232,213,163,0.6)' }}>{card.affirmation}</div>
          <div className="flex justify-center gap-2 flex-wrap">
            {Object.entries(card.attribute_effects).slice(0,2).map(([k,v]) => (
              <span key={k} className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(167,139,250,0.3)', color: '#C4B5FD' }}>
                +{v} {k === 'luck' ? 'โชคลาภ' : k === 'wealth' ? 'การเงิน' : k === 'love' ? 'ความรัก' : k === 'career' ? 'การงาน' : 'พลังงาน'}
              </span>
            ))}
          </div>
        </div>

        {/* Attribute preview */}
        <div className="card p-4 mb-4">
          <div className="text-sm font-semibold mb-3" style={{ color: '#1E1B4B' }}>สถานะพลังงาน 5 ด้าน</div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { emoji: '🍀', label: 'โชคลาภ', color: '#22C55E', bg: '#DCFCE7', val: 78 },
              { emoji: '💰', label: 'การเงิน', color: '#F59E0B', bg: '#FEF3C7', val: 85 },
              { emoji: '❤️', label: 'ความรัก', color: '#EC4899', bg: '#FCE7F3', val: 60 },
              { emoji: '💼', label: 'การงาน', color: '#3B82F6', bg: '#DBEAFE', val: 72 },
              { emoji: '⚡', label: 'พลังงาน', color: '#8B5CF6', bg: '#EDE9FE', val: 90 },
            ].map(a => (
              <div key={a.label} className="rounded-xl p-2" style={{ background: a.bg }}>
                <div className="text-xl mb-1">{a.emoji}</div>
                <div className="font-bold text-sm" style={{ color: a.color }}>{a.val}</div>
                <div className="text-xs" style={{ color: a.color, opacity: 0.7 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '🃏', title: 'จั่วไพ่วันละครั้ง', desc: 'ไพ่ Major Arcana 22 ใบ' },
            { icon: '🏆', title: 'แข่ง Leaderboard', desc: 'จัดอันดับ 6 ด้าน' },
            { icon: '👥', title: 'เพื่อน', desc: 'เช็กสถานะเพื่อนได้' },
            { icon: '🔥', title: 'Streak รายวัน', desc: 'รับโบนัสพลังงาน' },
          ].map(f => (
            <div key={f.title} className="card p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-sm mb-0.5" style={{ color: '#1E1B4B' }}>{f.title}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/login?mode=signup" className="block">
          <button className="btn-primary mb-3">✨ เริ่มต้นฟรี — จั่วไพ่วันนี้</button>
        </Link>
        <Link href="/leaderboard" className="block text-center text-sm font-medium" style={{ color: '#7C3AED' }}>
          ดู Leaderboard →
        </Link>
      </div>
    </main>
  );
}
