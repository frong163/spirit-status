export interface UserAttributes {
  luck: number;
  wealth: number;
  love: number;
  career: number;
  energy: number;
}

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  attributes: UserAttributes;
  spirit_score: number;
  aura_tier: AuraTier;
  daily_streak: number;
  longest_streak: number;
  last_draw_date?: string;
  badges: Badge[];
  created_at: string;
  global_rank?: number;
}

export type AuraTier = 'Wanderer' | 'Seeker' | 'Mystic' | 'Oracle' | 'Celestial';

export interface TarotCard {
  id: number;
  name: string;
  emoji: string;
  symbol: string;
  description: string;
  affirmation: string;
  attribute_effects: Partial<UserAttributes>;
  lucky_number: number;
  lucky_color: string;
  lucky_color_hex: string;
  lucky_direction: string;
}

export interface DrawRecord {
  id: string;
  user_id: string;
  card_id: number;
  card_name: string;
  drawn_at: string;
  attribute_changes: Partial<UserAttributes>;
  spirit_score_before: number;
  spirit_score_after: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  spirit_score: number;
  aura_tier: AuraTier;
  attributes: UserAttributes;
  daily_streak: number;
}

export type LeaderboardType = 'spirit' | 'luck' | 'wealth' | 'love' | 'career' | 'energy';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned_at: string;
}

export interface DailyExtras {
  lucky_number: number;
  lucky_color: string;
  lucky_color_hex: string;
  lucky_direction: string;
}

export interface ShareCardData {
  username: string;
  aura_tier: AuraTier;
  spirit_score: number;
  global_rank: number;
  total_users: number;
  top_percentage: number;
  today_card: TarotCard | null;
  attributes: UserAttributes;
}
