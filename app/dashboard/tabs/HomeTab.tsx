'use client';
import { getTopPercentage } from '@/lib/game';
import { SpiritScore } from '@/components/v0/SpiritScore';
import { AttributeCards } from '@/components/v0/AttributeCards';
import { TarotPreview } from '@/components/v0/TarotPreview';
import type { TabProps } from './types';

export default function HomeTab({ user, globalRank, totalUsers, todayCard, canDraw, isDrawing, prevAttrs, onDraw, showToast }: TabProps) {
  const topPct = getTopPercentage(globalRank, totalUsers);

  return (
    <div className="pb-nav flex flex-col gap-5 pt-2">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          สวัสดี {user.username} 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          เช็กพลังงานวันนี้ รับพลังดี ๆ เพื่อวันที่ดี
        </p>
      </div>

      {/* Spirit Score Ring */}
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        <SpiritScore
          score={user.spirit_score}
          streak={user.daily_streak}
          globalRank={globalRank}
          topPct={topPct}
        />
      </div>

      {/* Today's tarot card */}
      <TarotPreview
        card={todayCard}
        canDraw={canDraw}
        onDraw={onDraw}
        onViewCard={() => showToast('ดูรายละเอียดไพ่ได้ที่แท็บ "จั่วไพ่"')}
        isDrawing={isDrawing}
      />

      {/* Attribute bars */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">สถานะพลังงาน</h2>
          {prevAttrs && (
            <span className="text-xs font-semibold rounded-full px-2.5 py-1"
              style={{ background: '#DCFCE7', color: '#16A34A' }}>
              อัพเดทแล้ว ✓
            </span>
          )}
        </div>
        <AttributeCards attributes={user.attributes} prevAttributes={prevAttrs} />
      </div>

      {/* Lucky extras — only show if drew today */}
      {todayCard && (
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-foreground">ฤกษ์ดีวันนี้ ✨</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '🔢', label: 'เลขนำโชค', value: String(todayCard.lucky_number) },
              { emoji: '🎨', label: 'สีนำโชค',  value: todayCard.lucky_color, hex: todayCard.lucky_color_hex },
              { emoji: '🧭', label: 'ทิศมงคล',  value: todayCard.lucky_direction },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-3 text-center">
                <span className="text-2xl">{item.emoji}</span>
                {'hex' in item && (
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                    style={{ background: item.hex }} />
                )}
                <span className="text-sm font-bold text-foreground leading-tight">{item.value}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily streak */}
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Streak รายวัน</h2>
          <span className="text-2xl font-black text-primary">🔥 {user.daily_streak}</span>
        </div>
        {/* 7-dot track */}
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const filled = i < (user.daily_streak % 7 || (user.daily_streak > 0 && user.daily_streak % 7 === 0 ? 7 : 0));
            return (
              <div key={i} className="h-2.5 flex-1 rounded-full transition-all duration-500"
                style={{ background: filled ? 'linear-gradient(90deg,#F59E0B,#D97706)' : 'var(--secondary)' }} />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {user.daily_streak < 3  ? `อีก ${3  - user.daily_streak} วัน → รับโบนัส +2 พลังงาน` :
           user.daily_streak < 7  ? `อีก ${7  - user.daily_streak} วัน → รับโบนัส +5 พลังงาน` :
           user.daily_streak < 30 ? `อีก ${30 - user.daily_streak} วัน → รับ Badge พิเศษ` :
           '🏅 คุณทำได้! Streak 30 วันเต็ม'}
        </p>
      </div>

    </div>
  );
}
