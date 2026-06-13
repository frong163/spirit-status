'use client';

import type { TarotCard } from '@/types';

interface DailyExtrasProps {
  card: TarotCard;
}

export default function DailyExtras({ card }: DailyExtrasProps) {
  return (
    <div className="spirit-card rounded-2xl p-4">
      <h3 className="font-cinzel text-oracle-gold text-sm font-semibold tracking-wider mb-4 text-center">
        ✦ Today&apos;s Omens ✦
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {/* Lucky Number */}
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(123,47,190,0.15)', border: '1px solid rgba(123,47,190,0.2)' }}>
          <span className="text-xs text-oracle-light/50 font-cinzel tracking-wide">Number</span>
          <span className="font-mono font-bold text-2xl text-oracle-gold">{card.lucky_number}</span>
        </div>

        {/* Lucky Color */}
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(123,47,190,0.15)', border: '1px solid rgba(123,47,190,0.2)' }}>
          <span className="text-xs text-oracle-light/50 font-cinzel tracking-wide">Color</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border border-white/20"
              style={{ background: card.lucky_color_hex }} />
            <span className="text-oracle-light text-xs font-medium">{card.lucky_color}</span>
          </div>
        </div>

        {/* Lucky Direction */}
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(123,47,190,0.15)', border: '1px solid rgba(123,47,190,0.2)' }}>
          <span className="text-xs text-oracle-light/50 font-cinzel tracking-wide">Direction</span>
          <span className="text-oracle-light text-xs font-medium text-center">{card.lucky_direction}</span>
        </div>
      </div>
    </div>
  );
}
