'use client';

import { useState } from 'react';
import type { TarotCard, UserAttributes } from '@/types';
import { ATTRIBUTE_CONFIG } from '@/lib/game';

interface TarotCardProps {
  card: TarotCard | null;
  isFlipped: boolean;
  onDraw: () => void;
  isLoading?: boolean;
  canDraw: boolean;
  alreadyDrawn?: boolean;
}

export default function TarotCardDraw({ card, isFlipped, onDraw, isLoading, canDraw, alreadyDrawn }: TarotCardProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div className="tarot-card-wrapper" style={{ width: 200, height: 320 }}>
        <div className={`tarot-card-inner relative w-full h-full ${isFlipped ? 'flipped' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}>

          {/* Back face */}
          <div className="tarot-card-front absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A0F3C, #2D1B69)',
              border: '2px solid rgba(201,168,76,0.4)',
              boxShadow: '0 0 30px rgba(123,47,190,0.3)',
            }}>
            {/* Celtic knot pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, rgba(201,168,76,0.05) 0px, rgba(201,168,76,0.05) 1px, transparent 1px, transparent 20px),
                  repeating-linear-gradient(-45deg, rgba(201,168,76,0.05) 0px, rgba(201,168,76,0.05) 1px, transparent 1px, transparent 20px)
                `
              }} />
            </div>
            <div className="absolute inset-3 border border-oracle-gold/20 rounded-xl" />
            <div className="absolute inset-6 border border-oracle-gold/10 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-float" style={{ textShadow: '0 0 30px rgba(201,168,76,0.5)' }}>
                ✦
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-oracle-gold/60 font-cinzel text-xs tracking-widest">SPIRIT STATUS</span>
            </div>
          </div>

          {/* Front face (revealed card) */}
          <div className="tarot-card-back absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              background: card ? `linear-gradient(160deg, #1A0F3C 0%, #2D1B69 50%, #0A0618 100%)` : 'transparent',
              border: '2px solid rgba(201,168,76,0.6)',
              boxShadow: '0 0 40px rgba(201,168,76,0.2), 0 0 80px rgba(123,47,190,0.2)',
            }}>
            {card && (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-between p-5">
                  {/* Card number & symbol */}
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-oracle-gold/60 text-sm">{card.id.toString().padStart(2, '0')}</span>
                    <span className="text-oracle-gold/60 text-xl">{card.symbol}</span>
                  </div>

                  {/* Main emoji */}
                  <div className="text-7xl animate-float"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.4))' }}>
                    {card.emoji}
                  </div>

                  {/* Card name */}
                  <div className="text-center">
                    <h3 className="font-cinzel font-bold text-oracle-light text-lg leading-tight">
                      {card.name}
                    </h3>
                  </div>

                  {/* Attribute effects */}
                  <div className="w-full space-y-1.5">
                    {Object.entries(card.attribute_effects).map(([attr, val]) => {
                      const config = ATTRIBUTE_CONFIG[attr as keyof UserAttributes];
                      if (!config || !val) return null;
                      return (
                        <div key={attr} className="flex items-center justify-between text-xs">
                          <span style={{ color: config.color }}>{config.emoji} {config.label}</span>
                          <span className="font-mono font-bold text-green-400">+{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Decorative corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-oracle-gold/40" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-oracle-gold/40" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-oracle-gold/40" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-oracle-gold/40" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Draw button */}
      {!isFlipped && (
        <button
          onClick={onDraw}
          disabled={!canDraw || isLoading}
          className={`
            relative px-8 py-3 rounded-full font-cinzel font-semibold text-sm tracking-widest
            transition-all duration-300
            ${canDraw && !isLoading
              ? 'bg-gradient-to-r from-mystic to-indigo-mid text-oracle-light hover:scale-105 hover:shadow-lg cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
          style={canDraw && !isLoading ? {
            boxShadow: '0 0 30px rgba(123,47,190,0.4)',
            border: '1px solid rgba(201,168,76,0.3)'
          } : {}}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-oracle-gold/40 border-t-oracle-gold rounded-full animate-spin" />
              Reading the stars...
            </span>
          ) : alreadyDrawn ? (
            'Return Tomorrow'
          ) : (
            '✦ Draw Your Card ✦'
          )}
        </button>
      )}

      {/* Card description */}
      {isFlipped && card && (
        <div className="max-w-xs text-center animate-card-reveal">
          <p className="text-oracle-light/70 text-sm leading-relaxed italic">
            &ldquo;{card.description}&rdquo;
          </p>
          <p className="text-oracle-gold text-xs mt-3 font-medium">
            {card.affirmation}
          </p>
        </div>
      )}
    </div>
  );
}
