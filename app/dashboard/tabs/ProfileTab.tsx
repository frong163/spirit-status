'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierBg, getTierLabel, getTierEmoji, getRankSuffix, getTopPercentage, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { UserAttributes } from '@/types';

export default function ProfileTab({ user, globalRank, totalUsers, todayCard }: TabProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showShare, setShowShare] = useState(false);
  const tierColor = getTierColor(user.aura_tier);
  const topPct = getTopPercentage(globalRank, totalUsers);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const shareText = `✨ สถานะพลังงานวันนี้ของฉัน\n🎴 ${user.aura_tier} — ${user.spirit_score.toFixed(1)} pts\n🌍 อันดับ #${globalRank} (Top ${topPct}%)\n${todayCard ? `🃏 การ์ดวันนี้: ${todayCard.name}` : ''}\n\nมาเช็กพลังงานด้วยกันที่ Spirit Status!`;

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareText);
      return;
    }
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, '_blank');
    if (platform === 'line') window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-fadeInUp">
      {/* Profile hero */}
      <div className="card p-5 text-center">
        <div className="relative inline-flex items-center justify-center mb-3">
          <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${tierColor}30 0%, transparent 70%)`, filter: 'blur(8px)', transform: 'scale(1.5)' }} />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl"
            style={{ background: getTierBg(user.aura_tier), border: `3px solid ${tierColor}`, color: tierColor }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: '#1E1B4B' }}>{user.username}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span>{getTierEmoji(user.aura_tier)}</span>
          <span className="font-semibold text-sm" style={{ color: tierColor }}>{user.aura_tier}</span>
          <span className="text-sm" style={{ color: '#9CA3AF' }}>• {getTierLabel(user.aura_tier)}</span>
        </div>
        <div className="text-4xl font-black mt-3" style={{ color: '#7C3AED' }}>{user.spirit_score.toFixed(1)}</div>
        <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Spirit Score</div>

        <div className="flex justify-around mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
          {[
            { label: 'อันดับโลก', value: `#${globalRank}` },
            { label: 'Top', value: `${topPct}%` },
            { label: 'Streak', value: `🔥${user.daily_streak}` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-bold text-lg" style={{ color: '#7C3AED' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="card p-4">
        <div className="font-semibold mb-3" style={{ color: '#1E1B4B' }}>สถานะพลังงาน</div>
        <div className="space-y-3">
          {(Object.entries(user.attributes) as [keyof UserAttributes, number][]).map(([k, v]) => {
            const c = ATTR_CONFIG[k];
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: c.color }}>
                    {c.emoji} {c.labelTh}
                  </span>
                  <span className="font-bold text-sm" style={{ color: c.color }}>{v}<span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>/100</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${v}%`, background: c.gradient }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { emoji: '🔥', label: 'Streak สูงสุด', value: `${user.longest_streak} วัน` },
          { emoji: '🃏', label: 'จั่วไพ่มาแล้ว', value: `— ครั้ง` },
          { emoji: '🌍', label: 'อันดับโลก', value: `#${globalRank}${getRankSuffix(globalRank)}` },
          { emoji: '📅', label: 'เล่นมาตั้งแต่', value: new Date(user.created_at).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="font-bold" style={{ color: '#7C3AED' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="card p-4">
          <div className="font-semibold mb-3" style={{ color: '#1E1B4B' }}>ป้ายรางวัล</div>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b: any) => (
              <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: '#FEF3C7', color: '#D97706' }}>
                {b.emoji} {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="card p-4">
        <div className="font-semibold mb-3" style={{ color: '#1E1B4B' }}>แชร์สถานะพลังงาน</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'line', label: 'LINE', color: '#06C755', emoji: '💬' },
            { id: 'twitter', label: 'X (Twitter)', color: '#000', emoji: '𝕏' },
            { id: 'facebook', label: 'Facebook', color: '#1877F2', emoji: '📘' },
            { id: 'copy', label: 'คัดลอก', color: '#6B7280', emoji: '📋' },
          ].map(p => (
            <button key={p.id} onClick={() => handleShare(p.id)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: p.color }}>
              <span>{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Public profile link */}
      <div className="card p-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium" style={{ color: '#9CA3AF' }}>โปรไฟล์สาธารณะ</div>
          <div className="text-sm font-semibold mt-0.5" style={{ color: '#7C3AED' }}>
            /u/{user.username}
          </div>
        </div>
        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
          คัดลอก
        </button>
      </div>

      <button onClick={handleSignOut} className="btn-secondary">ออกจากระบบ</button>
    </div>
  );
}
