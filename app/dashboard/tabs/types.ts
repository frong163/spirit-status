import type { User, TarotCard, UserAttributes } from '@/types';

export interface TabProps {
  user: User;
  globalRank: number;
  totalUsers: number;
  todayCard: TarotCard | null;
  isFlipped: boolean;
  isDrawing: boolean;
  canDraw: boolean;
  prevAttrs: UserAttributes | null;
  onDraw: () => void;
  showToast: (msg: string) => void;
}
