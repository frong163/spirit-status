'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierLabel, getTierEmoji, getRankSuffix, getTopPercentage } from '@/lib/game';
import { AttributeCards } from '@/components/v0/AttributeCards';
import { Share2, Copy, LogOut, Link2 } from 'lucide-react';
import type { TabProps } from './types';

export default function ProfileTab({ user, globalRank, totalUsers, todayCard, showToast }: TabProps) {
  const router = useRouter();
  const supabase = createClient();
  const tc     = getTierColor(user.aura_tier);
  const topPct = getTopPercentage(globalRank, totalUsers);

  const signOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const shareText = `✨ Spirit Status วันนี้\n${user.aura_tier} (${getTierLabel(user.aura_tier)}) — ${user.spirit_score.toFixed(1)} pts\n🌍 อันดับ #${globalRank} Top ${topPct}%${todayCard ? `\n🃏 ไพ่วันนี้: ${todayCard.name}` : ''}\n\nเช็กพลังงานได้ที่ spirit-status.vercel.app`;

  const share = async (p: string) => {
    if (p === 'copy')    { await navigator.clipboard.writeText(shareText); showToast('📋 คัดลอกแล้ว!'); return; }
    if (p === 'line')    window.open(`https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(shareText)}`, '_blank');
    if (p === 'x')       window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    if (p === 'fb')      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="pb-nav flex flex-col gap-4 pt-2">
      <div>
        <h1 className="text-2xl font-black text-foreground">โปรไฟล์ 👤</h1>
      </div>

      {/* Profile hero */}
      <div className="rounded-3xl bg-card p-6 shadow-sm text-center">
        <div className="relative mx-auto mb-4" style={{ width: 88, height: 88 }}>
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: `radial-gradient(circle,${tc}25,transparent 70%)`, filter: 'blur(6px)' }} />
          <div className="relative flex h-full w-full items-center justify-center rounded-full font-black text-3xl"
            style={{ background: `${tc}15`, border: `3px solid ${tc}`, color: tc, boxShadow: `0 0 24px ${tc}30` }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <h2 className="text-xl font-black text-foreground">{user.username}</h2>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span>{getTierEmoji(user.aura_tier)}</span>
          <span className="font-bold text-sm" style={{ color: tc }}>{user.aura_tier}</span>
          <span className="text-sm text-muted-foreground">· {getTierLabel(user.aura_tier)}</span>
        </div>
        <div className="mt-3 text-5xl font-black" style={{ color: '#7C3AED', lineHeight: 1 }}>
          {user.spirit_score.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Spirit Score</div>

        <div className="mt-5 flex border-t pt-4" style={{ borderColor: '#F4F4F5' }}>
          {[
            { label: 'อันดับ', value: `#${globalRank}${getRankSuffix(globalRank)}` },
            { label: 'Top',    value: `${topPct}%` },
            { label: 'Streak', value: `🔥 ${user.daily_streak}` },
          ].map(s => (
            <div key={s.label} className="flex-1 text-center">
              <div className="text-lg font-black" style={{ color: '#7C3AED' }}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes */}
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-foreground">สถานะพลังงาน</h2>
        <AttributeCards attributes={user.attributes} />
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-foreground">ป้ายรางวัล 🏅</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b: any) => (
              <div key={b.id} className="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold"
                style={{ background: '#FEF3C7', color: '#D97706' }}>
                {b.emoji} {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-foreground flex items-center gap-2">
          <Share2 size={16} /> แชร์สถานะ
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'line', label: 'LINE',       color: '#06C755', emoji: '💬' },
            { id: 'x',   label: 'X (Twitter)', color: '#000',    emoji: '𝕏' },
            { id: 'fb',  label: 'Facebook',    color: '#1877F2', emoji: '📘' },
            { id: 'copy',label: 'คัดลอก',      color: '#52525B', emoji: '📋' },
          ].map(p => (
            <button key={p.id} onClick={() => share(p.id)}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-opacity active:opacity-80"
              style={{ background: p.color, border: 'none', cursor: 'pointer' }}>
              <span>{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>

        {/* Public profile link */}
        <div className="mt-3 flex items-center justify-between rounded-2xl p-3" style={{ background: '#F5F3FF' }}>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Link2 size={11}/> ลิงก์โปรไฟล์</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: '#7C3AED' }}>/u/{user.username}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`); showToast('📋 คัดลอกลิงก์แล้ว!'); }}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ background: 'white', color: '#7C3AED', border: 'none', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <Copy size={12}/> คัดลอก
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-opacity active:opacity-80"
        style={{ background: 'white', color: '#71717A', border: '2px solid #E4E4E7', cursor: 'pointer' }}>
        <LogOut size={15}/> ออกจากระบบ
      </button>
    </div>
  );
}
