import type { UserAttributes, AuraTier } from '@/types';

export const DEFAULT_ATTRIBUTES: UserAttributes = {
  luck: 50, wealth: 50, love: 50, career: 50, energy: 50,
};

// Spirit Score = weighted average (all equal for now, extensible)
export function calculateSpiritScore(attributes: UserAttributes): number {
  const { luck, wealth, love, career, energy } = attributes;
  return Math.round(((luck + wealth + love + career + energy) / 5) * 10) / 10;
}

export function getAuraTier(score: number): AuraTier {
  if (score <= 20) return 'Wanderer';
  if (score <= 40) return 'Seeker';
  if (score <= 60) return 'Mystic';
  if (score <= 80) return 'Oracle';
  return 'Celestial';
}

export function getTierColor(tier: AuraTier): string {
  const map: Record<AuraTier, string> = {
    Wanderer: '#9CA3AF', Seeker: '#60A5FA', Mystic: '#7C3AED', Oracle: '#F59E0B', Celestial: '#EC4899',
  };
  return map[tier];
}

export function getTierBg(tier: AuraTier): string {
  const map: Record<AuraTier, string> = {
    Wanderer: '#F3F4F6', Seeker: '#DBEAFE', Mystic: '#EDE9FE', Oracle: '#FEF3C7', Celestial: '#FCE7F3',
  };
  return map[tier];
}

export function getTierEmoji(tier: AuraTier): string {
  const map: Record<AuraTier, string> = {
    Wanderer: '🌫️', Seeker: '💙', Mystic: '💜', Oracle: '✨', Celestial: '🌟',
  };
  return map[tier];
}

export function getTierLabel(tier: AuraTier): string {
  const map: Record<AuraTier, string> = {
    Wanderer: 'นักเดินทาง', Seeker: 'ผู้แสวงหา', Mystic: 'นักลึกลับ', Oracle: 'โอราเคิล', Celestial: 'เทพบุตร/เทพธิดา',
  };
  return map[tier];
}

// Daily decay: attributes slowly drift back toward 50 if no draw
// Each day without draw: -0.5 per attribute (capped at 50 floor without draws)
export function applyDailyDecay(attributes: UserAttributes, daysMissed: number): UserAttributes {
  if (daysMissed <= 0) return attributes;
  const decay = Math.min(daysMissed * 0.5, 5); // max -5 per attribute
  const updated = { ...attributes };
  for (const key of Object.keys(updated) as (keyof UserAttributes)[]) {
    updated[key] = Math.max(updated[key] - decay, 10); // floor at 10
  }
  return updated;
}

export function applyAttributeEffects(current: UserAttributes, effects: Partial<UserAttributes>): UserAttributes {
  const updated = { ...current };
  for (const [k, v] of Object.entries(effects)) {
    const key = k as keyof UserAttributes;
    updated[key] = Math.min(100, Math.max(0, updated[key] + (v ?? 0)));
  }
  return updated;
}

export function getStreakBonus(streak: number): { attribute: keyof UserAttributes; amount: number } | null {
  const attrs: (keyof UserAttributes)[] = ['luck', 'wealth', 'love', 'career', 'energy'];
  const rand = attrs[Math.floor(Math.random() * attrs.length)];
  if (streak === 3) return { attribute: rand, amount: 2 };
  if (streak === 7) return { attribute: rand, amount: 5 };
  if (streak === 14) return { attribute: rand, amount: 8 };
  if (streak === 30) return { attribute: rand, amount: 15 };
  return null;
}

export function isNewDay(lastDate?: string): boolean {
  if (!lastDate) return true;
  return new Date(lastDate).toDateString() !== new Date().toDateString();
}

export function getTopPercentage(rank: number, total: number): number {
  if (total <= 1) return 100;
  return Math.round((rank / total) * 100 * 10) / 10;
}

export function getRankSuffix(rank: number): string {
  const j = rank % 10, k = rank % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export const ATTR_CONFIG = {
  luck:   { label: 'Luck',   labelTh: 'โชคลาภ',    emoji: '🍀', color: '#22C55E', bg: '#DCFCE7', gradient: 'linear-gradient(90deg,#22C55E,#16A34A)' },
  wealth: { label: 'Wealth', labelTh: 'ความมั่งคั่ง', emoji: '💰', color: '#F59E0B', bg: '#FEF3C7', gradient: 'linear-gradient(90deg,#F59E0B,#D97706)' },
  love:   { label: 'Love',   labelTh: 'ความรัก',    emoji: '❤️', color: '#EC4899', bg: '#FCE7F3', gradient: 'linear-gradient(90deg,#EC4899,#DB2777)' },
  career: { label: 'Career', labelTh: 'การงาน',     emoji: '💼', color: '#3B82F6', bg: '#DBEAFE', gradient: 'linear-gradient(90deg,#3B82F6,#2563EB)' },
  energy: { label: 'Energy', labelTh: 'พลังงาน',    emoji: '⚡', color: '#8B5CF6', bg: '#EDE9FE', gradient: 'linear-gradient(90deg,#8B5CF6,#7C3AED)' },
} as const;
