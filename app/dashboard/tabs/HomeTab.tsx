'use client';
import { getTierColor, getTierBg, getTierLabel, getTierEmoji, ATTR_CONFIG, getRankSuffix, getTopPercentage } from '@/lib/game';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function HomeTab({ user, globalRank, totalUsers, todayCard, canDraw, onDraw }: TabProps) {
  const tierColor = getTierColor(user.aura_tier);
  const tierBg = getTierBg(user.aura_tier);
  const topPct = getTopPercentage(globalRank, totalUsers);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (user.spirit_score / 100) * circumference;

  const radarData = [
    { a: '🍀โชคลาภ', v: user.attributes.luck },
    { a: '⚡พลังงาน', v: user.attributes.energy },
    { a: '💼การงาน', v: user.attributes.career },
    { a: '💰การเงิน', v: user.attributes.wealth },
    { a: '❤️ความรัก', v: user.attributes.love },
  ];

  return (
    <div className="space-y-4 animate-fadeInUp">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: '#1E1B4B' }}>
          สวัสดี {user.username} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          เช็กพลังงานวันนี้ รับพลังดี ๆ เพื่อวันที่ดีของคุณ
        </p>
      </div>

      {/* Spirit Score Card */}
      <div className="card p-5" style={{ background: `linear-gradient(135deg, #7C3AED, #6D28D9)` }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Spirit Score วันนี้</div>
            <div className="text-5xl font-black" style={{ color: 'white' }}>{user.spirit_score.toFixed(1)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {getTierEmoji(user.aura_tier)} {user.aura_tier}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{getTierLabel(user.aura_tier)}</span>
            </div>
          </div>
          {/* Ring */}
          <div className="relative" style={{ width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#sg)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                className="circle-progress" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-black" style={{ color: 'white' }}>{Math.round(user.spirit_score)}%</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Spirit</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="text-center flex-1">
            <div className="font-bold text-lg" style={{ color: 'white' }}>#{globalRank}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>อันดับโลก</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-bold text-lg" style={{ color: 'white' }}>Top {topPct}%</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>เปอร์เซ็นต์</div>
          </div>
          <div className="text-center flex-1">
            <div className="font-bold text-lg" style={{ color: 'white' }}>🔥 {user.daily_streak}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>วันติดต่อกัน</div>
          </div>
        </div>
      </div>

      {/* Attributes grid */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold" style={{ color: '#1E1B4B' }}>สถานะพลังงานของคุณ</div>
          <button className="text-xs font-medium" style={{ color: '#7C3AED' }}>ดูทั้งหมด →</button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(user.attributes) as [keyof UserAttributes, number][]).map(([k, v]) => {
            const c = ATTR_CONFIG[k];
            return (
              <div key={k} className="rounded-2xl p-3 text-center" style={{ background: c.bg }}>
                <div className="text-2xl mb-1">{c.emoji}</div>
                <div className="font-bold text-base" style={{ color: c.color }}>{v}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: c.color, opacity: 0.8 }}>/100</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${v}%`, background: c.gradient }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's card + draw CTA */}
      <div className="card p-4">
        <div className="font-semibold mb-3" style={{ color: '#1E1B4B' }}>การ์ดประจำวัน</div>
        {todayCard ? (
          <div className="flex items-center gap-4">
            <div className="tarot-card w-16 h-24 flex items-center justify-center text-3xl flex-shrink-0">
              <span>{todayCard.emoji}</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold" style={{ color: '#1E1B4B' }}>{todayCard.name}</div>
              <div className="text-sm mt-0.5 italic" style={{ color: '#6B7280' }}>{todayCard.affirmation}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(todayCard.attribute_effects).map(([k, v]) => {
                  const c = ATTR_CONFIG[k as keyof UserAttributes];
                  return <span key={k} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: c.bg, color: c.color }}>+{v} {c.labelTh}</span>;
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="tarot-card w-16 h-24 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl animate-float">🌙</span>
            </div>
            <div className="flex-1">
              <div className="text-sm mb-3" style={{ color: '#6B7280' }}>
                สุ่มการ์ด 3 ใบ เพื่อรับคำทำนายและปรับพลังงานในแต่ละด้าน
              </div>
              <button onClick={onDraw}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
                ✨ จั่วไพ่วันนี้
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Radar chart */}
      <div className="card p-4">
        <div className="font-semibold mb-2" style={{ color: '#1E1B4B' }}>สรุปพลังงานวันนี้</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#EDE9FE" />
            <PolarAngleAxis dataKey="a" tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Noto Sans Thai' }} />
            <Radar dataKey="v" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Lucky info */}
      {todayCard && (
        <div className="card p-4">
          <div className="font-semibold mb-3" style={{ color: '#1E1B4B' }}>ฤกษ์ดีวันนี้</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'เลขนำโชค', value: todayCard.lucky_number.toString(), emoji: '🔢' },
              { label: 'สีนำโชค', value: todayCard.lucky_color, emoji: '🎨', hex: todayCard.lucky_color_hex },
              { label: 'ทิศมงคล', value: todayCard.lucky_direction, emoji: '🧭' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: '#F8F7FF' }}>
                <div className="text-xl mb-1">{item.emoji}</div>
                {'hex' in item && <div className="w-4 h-4 rounded-full mx-auto mb-1 border border-gray-200" style={{ background: item.hex }} />}
                <div className="font-bold text-sm" style={{ color: '#1E1B4B' }}>{item.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
