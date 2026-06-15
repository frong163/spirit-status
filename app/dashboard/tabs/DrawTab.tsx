'use client';
import { ChevronRight } from 'lucide-react';
import { AttributeCards } from '@/components/v0/AttributeCards';
import { ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';

export default function DrawTab({ user, todayCard, isFlipped, isDrawing, canDraw, prevAttrs, onDraw }: TabProps) {
  return (
    <div className="pb-nav flex flex-col gap-5 pt-2">

      <div>
        <h1 className="text-2xl font-black text-foreground">การ์ดประจำวัน 🃏</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {canDraw ? 'ไพ่รอคุณอยู่ — จั่วได้ฟรี 1 ครั้ง/วัน' : 'คุณจั่วไพ่แล้ววันนี้ กลับมาพรุ่งนี้ 🌙'}
        </p>
      </div>

      {/* Flip card */}
      <div className="flex justify-center py-2">
        <div style={{ perspective: 1000, width: 200, height: 320 }}>
          <div style={{
            width: '100%', height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform .7s cubic-bezier(.4,0,.2,1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            position: 'relative',
          }}>
            {/* Back */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden', borderRadius: 20,
              background: 'linear-gradient(160deg,#2D1B69,#0D0520)',
              border: '2px solid rgba(245,158,11,.45)',
              boxShadow: '0 16px 48px rgba(45,27,105,.5)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              {/* Celtic grid */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 20, opacity: .06,
                backgroundImage: 'repeating-linear-gradient(45deg,rgba(245,158,11,1) 0,rgba(245,158,11,1) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(245,158,11,1) 0,rgba(245,158,11,1) 1px,transparent 0,transparent 50%)',
                backgroundSize: '20px 20px',
              }} />
              {/* Corner marks */}
              {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h])=>(
                <div key={`${v}${h}`} style={{
                  position:'absolute',[v]:12,[h]:12,width:18,height:18,
                  borderTop: v==='top' ? '2px solid rgba(245,158,11,.4)' : undefined,
                  borderBottom: v==='bottom' ? '2px solid rgba(245,158,11,.4)' : undefined,
                  borderLeft: h==='left' ? '2px solid rgba(245,158,11,.4)' : undefined,
                  borderRight: h==='right' ? '2px solid rgba(245,158,11,.4)' : undefined,
                }}/>
              ))}
              <span style={{ fontSize: 56, position: 'relative', zIndex: 1 }}>🌙</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(245,158,11,.5)', position: 'relative', zIndex: 1 }}>
                SPIRIT STATUS
              </span>
            </div>

            {/* Front */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden', borderRadius: 20,
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(160deg,#2D1B69,#0D0520)',
              border: '2px solid rgba(245,158,11,.6)',
              boxShadow: '0 16px 48px rgba(45,27,105,.5)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'space-between', padding: 20,
            }}>
              {todayCard && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(245,158,11,.5)', fontFamily: 'monospace' }}>
                      {String(todayCard.id).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'rgba(245,158,11,.5)' }}>{todayCard.symbol}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 56 }}>{todayCard.emoji}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: '#F5F3FF', marginBottom: 4 }}>{todayCard.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,243,255,.5)', lineHeight: 1.5 }}>{todayCard.affirmation}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(todayCard.attribute_effects).map(([k, v]) => {
                      const c = ATTR_CONFIG[k as keyof UserAttributes];
                      return (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ color: 'rgba(255,255,255,.7)' }}>{c.emoji} {c.labelTh}</span>
                          <span style={{ fontWeight: 900, color: '#86EFAC' }}>+{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Draw button */}
      {!isFlipped && (
        <button
          onClick={onDraw} disabled={!canDraw || isDrawing}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            background: canDraw ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'var(--secondary)',
            color: canDraw ? 'white' : 'var(--muted-foreground)',
            fontSize: 16, fontWeight: 800, fontFamily: 'inherit',
            cursor: canDraw && !isDrawing ? 'pointer' : 'not-allowed',
            boxShadow: canDraw ? '0 6px 20px rgba(124,58,237,.4)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isDrawing ? 0.75 : 1,
          }}>
          {isDrawing
            ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />กำลังอ่านดวงดาว...</>
            : canDraw ? '✨ จั่วไพ่วันนี้' : '🌙 กลับมาพรุ่งนี้'
          }
        </button>
      )}

      {/* Result */}
      {isFlipped && todayCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .5s ease both' }}>
          {/* Card description */}
          <div className="rounded-3xl bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black text-foreground mb-1">{todayCard.name}</h2>
            <p className="text-sm text-muted-foreground italic mb-5">"{todayCard.description}"</p>
            {prevAttrs && (
              <>
                <p className="text-sm font-bold text-foreground mb-3">พลังงานที่เปลี่ยนแปลง</p>
                <AttributeCards attributes={user.attributes} prevAttributes={prevAttrs} />
              </>
            )}
          </div>

          {/* Lucky */}
          <div className="rounded-3xl bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground mb-4">ฤกษ์ดีวันนี้ ✨</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '🔢', label: 'เลขนำโชค', value: String(todayCard.lucky_number) },
                { emoji: '🎨', label: 'สีนำโชค', value: todayCard.lucky_color, hex: todayCard.lucky_color_hex },
                { emoji: '🧭', label: 'ทิศมงคล', value: todayCard.lucky_direction },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-3 text-center">
                  <span className="text-2xl">{item.emoji}</span>
                  {'hex' in item && <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ background: item.hex }} />}
                  <span className="text-sm font-bold text-foreground leading-tight">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
