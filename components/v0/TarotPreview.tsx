'use client';
import { ChevronRight } from 'lucide-react';
import type { TarotCard } from '@/types';

interface TarotPreviewProps {
  card: TarotCard | null;
  canDraw: boolean;
  onDraw: () => void;
  onViewCard: () => void;
  isDrawing?: boolean;
}

export function TarotPreview({ card, canDraw, onDraw, onViewCard, isDrawing }: TarotPreviewProps) {
  if (!card) {
    /* ─── ยังไม่ได้จั่ว ─── */
    return (
      <section aria-label="ไพ่ทาโรต์ประจำวัน">
        <button
          type="button"
          onClick={onDraw}
          disabled={isDrawing}
          className="flex w-full items-center gap-4 rounded-3xl text-left shadow-sm transition-transform active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            padding: 20,
            border: 'none',
            cursor: isDrawing ? 'not-allowed' : 'pointer',
            opacity: isDrawing ? 0.8 : 1,
          }}
        >
          {/* Card back */}
          <div
            className="relative flex h-32 w-20 shrink-0 items-center justify-center rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg,#2D1B69,#0D0520)',
              border: '2px solid rgba(245,158,11,.5)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 0 12px rgba(245,158,11,.5))' }}>🌙</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.65)' }}>
              ไพ่ประจำวันนี้
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold" style={{ color: 'white' }}>
              {isDrawing ? 'กำลังอ่านดวง...' : 'จั่วไพ่วันนี้!'}
            </h2>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.65)' }}>
              ปรับพลังงาน 5 ด้าน รับคำทำนายและฤกษ์ดีประจำวัน
            </p>
            <span
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: '#FCD34D' }}
            >
              {isDrawing ? '⏳ กำลังจั่ว...' : '✨ จั่วไพ่เลย'}
              {!isDrawing && <ChevronRight className="size-4" aria-hidden="true" />}
            </span>
          </div>
        </button>
      </section>
    );
  }

  /* ─── จั่วแล้ว — แสดงการ์ด ─── */
  return (
    <section aria-label="ไพ่ทาโรต์ประจำวัน">
      <button
        type="button"
        onClick={onViewCard}
        className="flex w-full items-center gap-4 rounded-3xl bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
      >
        {/* Card face */}
        <div
          className="relative flex h-32 w-20 shrink-0 flex-col items-center justify-center rounded-2xl overflow-hidden gap-1"
          style={{
            background: 'linear-gradient(160deg,#2D1B69,#0D0520)',
            border: '2px solid rgba(245,158,11,.5)',
          }}
        >
          <span style={{ fontSize: 36 }}>{card.emoji}</span>
          <span style={{ fontSize: 9, color: 'rgba(245,158,11,.6)', fontWeight: 700, letterSpacing: '0.1em' }}>
            {String(card.id).padStart(2, '0')}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">ไพ่ประจำวันนี้</p>
          <h2 className="mt-0.5 text-2xl font-extrabold text-foreground">{card.name}</h2>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {card.affirmation}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            ดูคำทำนายและฤกษ์ดี
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </button>
    </section>
  );
}
