'use client';
import { getAuraTier, getTierLabel } from '@/lib/game';

interface SpiritScoreProps {
  score: number;
  streak: number;
  globalRank: number;
  topPct: number;
}

const TIER_MESSAGES: Record<string, string> = {
  Wanderer:  'เริ่มต้นการเดินทาง ✨',
  Seeker:    'กำลังค้นหาตัวเอง 🔵',
  Mystic:    'พลังกำลังตื่นตัว 💜',
  Oracle:    'วันนี้พลังดีเยี่ยม ✨',
  Celestial: 'พลังสูงสุด เทพบุตร/ธิดา 🌟',
};

export function SpiritScore({ score, streak, globalRank, topPct }: SpiritScoreProps) {
  const radius     = 120;
  const stroke     = 16;
  const norm       = radius - stroke / 2;
  const circumference = norm * 2 * Math.PI;
  const offset     = circumference - (Math.min(score / 100, 1)) * circumference;
  const tier       = getAuraTier(score);
  const msg        = TIER_MESSAGES[tier] ?? 'วันนี้พลังดีเยี่ยม ✨';

  return (
    <section aria-label="คะแนนพลังจิตวันนี้" className="flex flex-col items-center">
      <p className="mb-4 text-base font-medium text-muted-foreground">พลังจิตวันนี้</p>

      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90" aria-hidden="true">
          <circle
            stroke="var(--secondary)" fill="transparent"
            strokeWidth={stroke} r={norm} cx={radius} cy={radius}
          />
          <circle
            stroke="var(--primary)" fill="transparent"
            strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
            r={norm} cx={radius} cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-7xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
            {Math.round(score)}
          </span>
          <span className="mt-1 text-sm font-medium text-muted-foreground">จาก 100 คะแนน</span>
        </div>
      </div>

      {/* Tier pill */}
      <p className="mt-5 rounded-full bg-secondary px-5 py-2 text-base font-semibold text-secondary-foreground">
        {msg}
      </p>

      {/* Stats row */}
      <div className="mt-5 flex w-full justify-around">
        {[
          { label: 'อันดับโลก', value: `#${globalRank}` },
          { label: 'Top',       value: `${topPct}%`       },
          { label: 'Streak',    value: `🔥 ${streak}`     },
        ].map(s => (
          <div key={s.label} className="text-center">
            <div className="text-lg font-black text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
