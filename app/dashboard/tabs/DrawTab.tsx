'use client';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';
import { ATTR_CONFIG } from '@/lib/game';

export default function DrawTab({ user, todayCard, isFlipped, isDrawing, canDraw, prevAttrs, onDraw }: TabProps) {
  return (
    <div className="space-y-5 animate-fadeInUp">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#1E1B4B' }}>การ์ดประจำวัน</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          {canDraw ? 'ไพ่รอคุณอยู่ — จั่วได้ฟรี 1 ครั้ง/วัน' : 'คุณจั่วไพ่แล้ววันนี้ กลับมาพรุ่งนี้นะ'}
        </p>
      </div>

      {/* Card display */}
      <div className="flex justify-center">
        <div className="relative" style={{ perspective: 1000 }}>
          <div className={`relative transition-all duration-700`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', width: 200, height: 320 }}>
            {/* Back */}
            <div className="tarot-card absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{
                  width: '100%', height: '100%', borderRadius: 18,
                  backgroundImage: `repeating-linear-gradient(45deg, rgba(245,158,11,0.05) 0px, rgba(245,158,11,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(-45deg, rgba(245,158,11,0.05) 0px, rgba(245,158,11,0.05) 1px, transparent 1px, transparent 16px)`
                }} />
              </div>
              <div className="text-6xl animate-float relative z-10" style={{ filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.4))' }}>🌙</div>
              <div className="absolute bottom-5 text-xs font-semibold tracking-widest" style={{ color: 'rgba(245,158,11,0.5)' }}>SPIRIT STATUS</div>
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: 'rgba(245,158,11,0.3)' }} />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: 'rgba(245,158,11,0.3)' }} />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: 'rgba(245,158,11,0.3)' }} />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: 'rgba(245,158,11,0.3)' }} />
            </div>
            {/* Front */}
            <div className="tarot-card absolute inset-0 flex flex-col items-center justify-between p-5" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              {todayCard && <>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono" style={{ color: 'rgba(245,158,11,0.5)' }}>{todayCard.id.toString().padStart(2,'0')}</span>
                  <span style={{ color: 'rgba(245,158,11,0.5)' }}>{todayCard.symbol}</span>
                </div>
                <div className="text-6xl animate-float" style={{ filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.3))' }}>{todayCard.emoji}</div>
                <div className="text-center">
                  <div className="font-bold text-lg" style={{ color: '#E8D5A3' }}>{todayCard.name}</div>
                  <div className="text-xs mt-1 italic" style={{ color: 'rgba(232,213,163,0.6)' }}>{todayCard.affirmation}</div>
                </div>
                <div className="w-full space-y-1">
                  {Object.entries(todayCard.attribute_effects).map(([k, v]) => {
                    const c = ATTR_CONFIG[k as keyof UserAttributes];
                    return (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span style={{ color: c.color }}>{c.emoji} {c.labelTh}</span>
                        <span className="font-bold" style={{ color: '#4ADE80' }}>+{v}</span>
                      </div>
                    );
                  })}
                </div>
              </>}
            </div>
          </div>
        </div>
      </div>

      {/* Draw button */}
      {!isFlipped && (
        <div className="px-4">
          <button onClick={onDraw} disabled={!canDraw || isDrawing} className="btn-primary">
            {isDrawing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                กำลังอ่านดวงดาว...
              </span>
            ) : canDraw ? '✨ จั่วไพ่วันนี้' : '🌙 กลับมาพรุ่งนี้'}
          </button>
        </div>
      )}

      {/* Card description after flip */}
      {isFlipped && todayCard && (
        <div className="card p-5 animate-fadeInUp">
          <div className="text-center mb-4">
            <div className="font-bold text-lg mb-1" style={{ color: '#1E1B4B' }}>{todayCard.name}</div>
            <p className="text-sm italic" style={{ color: '#6B7280' }}>"{todayCard.description}"</p>
          </div>

          {/* Attribute changes */}
          {prevAttrs && (
            <div className="space-y-2.5 mt-4">
              <div className="text-sm font-semibold mb-2" style={{ color: '#1E1B4B' }}>พลังงานที่เปลี่ยนแปลง</div>
              {(Object.entries(user.attributes) as [keyof UserAttributes, number][]).map(([k, v]) => {
                const c = ATTR_CONFIG[k];
                const prev = prevAttrs[k];
                const diff = v - prev;
                return (
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: c.color }}>
                        {c.emoji} {c.labelTh}
                      </span>
                      <div className="flex items-center gap-2">
                        {diff !== 0 && (
                          <span className="text-xs font-bold" style={{ color: diff > 0 ? '#22C55E' : '#EF4444' }}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                        <span className="text-sm font-bold" style={{ color: c.color }}>{v}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${v}%`, background: c.gradient }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lucky extras */}
      {isFlipped && todayCard && (
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
                {'hex' in item && <div className="w-4 h-4 rounded-full mx-auto mb-1 border" style={{ background: item.hex }} />}
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
