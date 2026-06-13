'use client';

import { useRef } from 'react';
import type { ShareCardData } from '@/types';
import { getTierColor, getRankSuffix, ATTR_CONFIG } from '@/lib/game';
import TierBadge from '@/components/ui/TierBadge';

interface ShareCardProps {
  data: ShareCardData;
  onClose: () => void;
}

export default function ShareCard({ data, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const tierColor = getTierColor(data.aura_tier);

  const handleShare = async (platform: string) => {
    const text = `✨ My Spirit Status:\n${data.aura_tier} — ${data.spirit_score} pts\n🌍 Global Rank: #${data.global_rank} (Top ${data.top_percentage}%)\n🃏 Today's Card: ${data.today_card?.name ?? 'Unknown'}\n\nDraw your daily tarot card at spirit-status.app`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(text);
      return;
    }
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://spirit-status.app')}&quote=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-sm">
        {/* Share Card Visual */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: 'linear-gradient(160deg, #1A0F3C 0%, #0A0618 40%, #2D1B69 100%)',
            border: `2px solid ${tierColor}60`,
            boxShadow: `0 0 60px ${tierColor}30`,
          }}
        >
          {/* Stars */}
          <div className="absolute inset-0 stars-bg opacity-50" />

          {/* Header */}
          <div className="relative text-center mb-6">
            <div className="text-oracle-gold/60 font-cinzel text-xs tracking-widest mb-2">SPIRIT STATUS</div>
            <div className="text-5xl mb-2 animate-float">
              {data.today_card?.emoji ?? '✦'}
            </div>
            <h2 className="font-cinzel font-bold text-oracle-light text-xl">{data.username}</h2>
            <div className="mt-2">
              <TierBadge tier={data.aura_tier} size="md" />
            </div>
          </div>

          {/* Spirit Score */}
          <div className="relative text-center mb-5">
            <div className="text-oracle-gold/60 text-xs font-cinzel tracking-wider mb-1">SPIRIT SCORE</div>
            <div className="font-mono font-black text-5xl gold-text">
              {data.spirit_score.toFixed(1)}
            </div>
          </div>

          {/* Rank info */}
          <div className="relative flex justify-around mb-5">
            <div className="text-center">
              <div className="text-oracle-light/50 text-xs font-cinzel mb-1">GLOBAL RANK</div>
              <div className="font-mono font-bold text-oracle-gold text-lg">
                #{data.global_rank}<span className="text-xs text-oracle-gold/60">{getRankSuffix(data.global_rank)}</span>
              </div>
            </div>
            <div className="w-px bg-oracle-gold/20" />
            <div className="text-center">
              <div className="text-oracle-light/50 text-xs font-cinzel mb-1">TOP</div>
              <div className="font-mono font-bold text-oracle-gold text-lg">
                {data.top_percentage}%
              </div>
            </div>
            <div className="w-px bg-oracle-gold/20" />
            <div className="text-center">
              <div className="text-oracle-light/50 text-xs font-cinzel mb-1">TODAY&apos;S CARD</div>
              <div className="text-oracle-light text-sm font-medium">
                {data.today_card?.name ?? '—'}
              </div>
            </div>
          </div>

          {/* Attribute mini bars */}
          <div className="relative grid grid-cols-5 gap-1">
            {(Object.entries(data.attributes) as [string, number][]).map(([attr, value]) => {
              const config = ATTR_CONFIG[attr as keyof typeof ATTR_CONFIG];
              if (!config) return null;
              return (
                <div key={attr} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{config.emoji}</span>
                  <div className="w-full h-12 rounded-full overflow-hidden flex flex-col-reverse"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="w-full rounded-full transition-all"
                      style={{
                        height: `${value}%`,
                        background: config.color,
                        boxShadow: `0 0 6px ${config.color}80`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-oracle-light/60">{value}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="relative mt-4 pt-3 border-t border-oracle-gold/15 text-center">
            <span className="text-oracle-gold/40 text-xs font-cinzel tracking-widest">spirit-status.app</span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleShare('twitter')}
            className="py-3 rounded-xl font-cinzel text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1DA1F2, #0C85D0)', color: 'white' }}
          >
            Share on 𝕏
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="py-3 rounded-xl font-cinzel text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1877F2, #0C5EBF)', color: 'white' }}
          >
            Facebook
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="py-3 rounded-xl font-cinzel text-sm font-semibold transition-all duration-200 hover:scale-105 col-span-2"
            style={{ background: 'rgba(123,47,190,0.3)', border: '1px solid rgba(123,47,190,0.5)', color: '#E8D5A3' }}
          >
            📋 Copy Text
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-xl text-oracle-light/50 text-sm font-cinzel hover:text-oracle-light/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
