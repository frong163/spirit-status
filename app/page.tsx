'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MAJOR_ARCANA } from '@/lib/tarot';
import { getTierColor } from '@/lib/game';
import type { AuraTier } from '@/types';

const TIERS: { tier: AuraTier; range: string; emoji: string }[] = [
  { tier: 'Wanderer', range: '0–20', emoji: '🌫️' },
  { tier: 'Seeker', range: '21–40', emoji: '🔵' },
  { tier: 'Mystic', range: '41–60', emoji: '💜' },
  { tier: 'Oracle', range: '61–80', emoji: '✨' },
  { tier: 'Celestial', range: '81–100', emoji: '🌟' },
];

export default function HomePage() {
  const [featuredCard, setFeaturedCard] = useState(MAJOR_ARCANA[19]); // The Sun
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedCard(MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)]);
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 stars-bg opacity-60 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(123,47,190,0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4 animate-float" style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.4))' }}>
            ✦
          </div>
          <h1 className="font-cinzel font-black text-4xl tracking-wider mb-2">
            <span className="gold-text">SPIRIT</span>
            <span className="text-oracle-light"> STATUS</span>
          </h1>
          <p className="text-oracle-light/60 text-sm tracking-wide">
            Daily Tarot · Cosmic Rankings · Aura Tiers
          </p>
        </div>

        {/* Featured card cycling */}
        <div className="spirit-card rounded-3xl p-6 mb-6 text-center"
          style={{ boxShadow: '0 0 40px rgba(123,47,190,0.2)' }}>
          <div className="text-xs font-cinzel tracking-widest text-oracle-gold/60 mb-3">TODAY&apos;S ENERGY</div>
          <div key={tick} className="text-7xl mb-3 animate-card-reveal"
            style={{ filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.3))' }}>
            {featuredCard.emoji}
          </div>
          <div className="font-cinzel font-bold text-oracle-light text-lg mb-1">{featuredCard.name}</div>
          <div className="text-oracle-light/50 text-xs italic mb-3">{featuredCard.affirmation}</div>
          <div className="flex justify-center gap-4">
            {Object.entries(featuredCard.attribute_effects).slice(0, 2).map(([attr, val]) => (
              <span key={attr} className="text-xs bg-mystic/20 border border-mystic/30 rounded-full px-3 py-1 text-oracle-light/80">
                +{val} {attr.charAt(0).toUpperCase() + attr.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Aura Tiers */}
        <div className="mb-6">
          <h2 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest text-center mb-3">AURA TIERS</h2>
          <div className="grid grid-cols-5 gap-1.5">
            {TIERS.map(({ tier, range, emoji }) => (
              <div key={tier} className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-center"
                style={{
                  background: `${getTierColor(tier)}10`,
                  border: `1px solid ${getTierColor(tier)}30`,
                }}>
                <span className="text-xl">{emoji}</span>
                <span className="font-cinzel text-xs font-semibold" style={{ color: getTierColor(tier) }}>
                  {tier}
                </span>
                <span className="text-oracle-light/40 text-xs">{range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '🃏', title: '22 Cards', desc: 'Major Arcana deck with unique attribute effects' },
            { icon: '🏆', title: 'Global Rank', desc: 'Compete across 6 different leaderboards' },
            { icon: '🔥', title: 'Daily Streaks', desc: 'Streak rewards boost your attributes' },
            { icon: '📤', title: 'Share Aura', desc: 'Beautiful cards for social platforms' },
          ].map(f => (
            <div key={f.title} className="spirit-card rounded-2xl p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-cinzel font-semibold text-oracle-light text-sm mb-1">{f.title}</div>
              <div className="text-oracle-light/50 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/login?mode=signup"
            className="block w-full py-4 text-center rounded-2xl font-cinzel font-bold text-base tracking-wider transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7B2FBE, #C9A84C)',
              color: 'white',
              boxShadow: '0 0 30px rgba(123,47,190,0.5)',
            }}
          >
            ✦ Begin Your Journey ✦
          </Link>
          <Link
            href="/login"
            className="block w-full py-3.5 text-center rounded-2xl font-cinzel text-sm tracking-wider text-oracle-light/70 hover:text-oracle-light transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Already initiated? Sign In
          </Link>
          <Link
            href="/leaderboard"
            className="block w-full py-3 text-center rounded-2xl font-cinzel text-sm tracking-wider text-oracle-gold/70 hover:text-oracle-gold transition-colors"
          >
            View Global Leaderboard →
          </Link>
        </div>

        <p className="text-center text-oracle-light/25 text-xs mt-8 font-cinzel">
          One card per day. Infinite possibilities.
        </p>
      </div>
    </main>
  );
}
