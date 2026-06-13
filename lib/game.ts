import type { UserAttributes, AuraTier, User } from '@/types';

export const DEFAULT_ATTRIBUTES: UserAttributes = {
  luck: 50,
  wealth: 50,
  love: 50,
  career: 50,
  energy: 50,
};

export function calculateSpiritScore(attributes: UserAttributes): number {
  const values = Object.values(attributes);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.round(avg * 10) / 10;
}

export function getAuraTier(score: number): AuraTier {
  if (score <= 20) return 'Wanderer';
  if (score <= 40) return 'Seeker';
  if (score <= 60) return 'Mystic';
  if (score <= 80) return 'Oracle';
  return 'Celestial';
}

export function getTierColor(tier: AuraTier): string {
  switch (tier) {
    case 'Wanderer': return '#9CA3AF';
    case 'Seeker': return '#60A5FA';
    case 'Mystic': return '#A78BFA';
    case 'Oracle': return '#FCD34D';
    case 'Celestial': return '#F9A8D4';
    default: return '#9CA3AF';
  }
}

export function getTierGlow(tier: AuraTier): string {
  switch (tier) {
    case 'Wanderer': return 'rgba(156,163,175,0.4)';
    case 'Seeker': return 'rgba(96,165,250,0.4)';
    case 'Mystic': return 'rgba(167,139,250,0.4)';
    case 'Oracle': return 'rgba(252,211,77,0.4)';
    case 'Celestial': return 'rgba(249,168,212,0.6)';
    default: return 'rgba(156,163,175,0.4)';
  }
}

export function getTierEmoji(tier: AuraTier): string {
  switch (tier) {
    case 'Wanderer': return '🌫️';
    case 'Seeker': return '🔵';
    case 'Mystic': return '💜';
    case 'Oracle': return '✨';
    case 'Celestial': return '🌟';
    default: return '🌫️';
  }
}

export function applyAttributeEffects(
  current: UserAttributes,
  effects: Partial<UserAttributes>
): UserAttributes {
  const updated = { ...current };
  for (const [key, value] of Object.entries(effects)) {
    const attr = key as keyof UserAttributes;
    updated[attr] = Math.min(100, Math.max(0, updated[attr] + (value ?? 0)));
  }
  return updated;
}

export function getStreakReward(streak: number): { attribute: keyof UserAttributes; amount: number } | null {
  const attributes: (keyof UserAttributes)[] = ['luck', 'wealth', 'love', 'career', 'energy'];
  const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];
  
  if (streak === 3) return { attribute: randomAttr, amount: 2 };
  if (streak === 7) return { attribute: randomAttr, amount: 5 };
  return null;
}

export function isNewDay(lastDrawDate?: string): boolean {
  if (!lastDrawDate) return true;
  const last = new Date(lastDrawDate);
  const today = new Date();
  return last.toDateString() !== today.toDateString();
}

export function getTopPercentage(rank: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((rank / total) * 100 * 10) / 10;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getRankSuffix(rank: number): string {
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export const ATTRIBUTE_CONFIG = {
  luck: { label: 'Luck', emoji: '🍀', color: '#4ADE80', progressClass: 'progress-luck' },
  wealth: { label: 'Wealth', emoji: '💰', color: '#FCD34D', progressClass: 'progress-wealth' },
  love: { label: 'Love', emoji: '❤️', color: '#F472B6', progressClass: 'progress-love' },
  career: { label: 'Career', emoji: '💼', color: '#60A5FA', progressClass: 'progress-career' },
  energy: { label: 'Energy', emoji: '⚡', color: '#C084FC', progressClass: 'progress-energy' },
} as const;

export const LEADERBOARD_CONFIG = {
  spirit: { label: 'Spirit Score', emoji: '✨', sortKey: 'spirit_score' },
  luck: { label: 'Luck', emoji: '🍀', sortKey: 'luck' },
  wealth: { label: 'Wealth', emoji: '💰', sortKey: 'wealth' },
  love: { label: 'Love', emoji: '❤️', sortKey: 'love' },
  career: { label: 'Career', emoji: '💼', sortKey: 'career' },
  energy: { label: 'Energy', emoji: '⚡', sortKey: 'energy' },
} as const;
