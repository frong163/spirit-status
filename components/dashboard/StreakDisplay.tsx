'use client';

interface StreakDisplayProps {
  streak: number;
  longestStreak: number;
}

const MILESTONES = [
  { days: 3, label: '+2 Random Attr', emoji: '🌟' },
  { days: 7, label: '+5 Random Attr', emoji: '💫' },
  { days: 30, label: 'Eternal Flame Badge', emoji: '🏅' },
];

export default function StreakDisplay({ streak, longestStreak }: StreakDisplayProps) {
  const nextMilestone = MILESTONES.find(m => m.days > streak);

  return (
    <div className="spirit-card rounded-2xl p-4">
      <h3 className="font-cinzel text-oracle-gold/80 text-xs tracking-widest mb-3">DAILY STREAK</h3>

      {/* Flame display */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl" style={{ filter: streak > 0 ? 'drop-shadow(0 0 8px rgba(251,146,60,0.6))' : 'none' }}>
          {streak === 0 ? '🕯️' : '🔥'}
        </div>
        <div>
          <div className="font-mono font-black text-3xl text-oracle-gold">{streak}</div>
          <div className="text-oracle-light/40 text-xs font-cinzel">
            day{streak !== 1 ? 's' : ''} in a row
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-mono text-sm text-oracle-light/50">{longestStreak}</div>
          <div className="text-oracle-light/30 text-xs font-cinzel">best</div>
        </div>
      </div>

      {/* Streak dots */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full transition-all duration-300"
            style={{
              background: i < (streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0))
                ? 'linear-gradient(90deg, #F97316, #EAB308)'
                : 'rgba(255,255,255,0.08)',
              boxShadow: i < (streak % 7 || (streak > 0 && streak % 7 === 0 ? 7 : 0))
                ? '0 0 6px rgba(251,146,60,0.5)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Next milestone */}
      {nextMilestone && (
        <div className="flex items-center gap-2 text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
          <span>{nextMilestone.emoji}</span>
          <span className="text-oracle-light/50">
            <span className="text-oracle-gold font-mono font-bold">{nextMilestone.days - streak}</span>
            {' '}more days → <span className="text-oracle-light/70">{nextMilestone.label}</span>
          </span>
        </div>
      )}

      {/* Milestones list */}
      <div className="mt-3 space-y-1.5">
        {MILESTONES.map(m => (
          <div key={m.days} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span>{m.emoji}</span>
              <span className="font-cinzel text-oracle-light/50">{m.days}-day streak</span>
            </span>
            <span className={streak >= m.days ? 'text-green-400 font-medium' : 'text-oracle-light/30'}>
              {streak >= m.days ? '✓ Claimed' : m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
