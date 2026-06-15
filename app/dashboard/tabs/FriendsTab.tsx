'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import { Search, UserPlus, UserCheck, X } from 'lucide-react';
import type { TabProps } from './types';
import type { AuraTier, UserAttributes } from '@/types';

interface FriendRow {
  id: string; username: string; aura_tier: AuraTier;
  spirit_score: number; attributes: UserAttributes;
  daily_streak: number; friendship_id: string;
  status: string; is_requester: boolean;
}

export default function FriendsTab({ user, showToast }: TabProps) {
  const supabase = createClient();
  const [friends, setFriends]   = useState<FriendRow[]>([]);
  const [pending, setPending]   = useState<FriendRow[]>([]);
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState<any[]>([]);
  const [view, setView]         = useState<'friends' | 'search'>('friends');
  const [loading, setLoading]   = useState(true);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: fs } = await supabase.from('friendships').select('*').or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    if (!fs || fs.length === 0) { setLoading(false); return; }
    const ids = fs.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
    if (!profiles) { setLoading(false); return; }
    const rows: FriendRow[] = fs.map(f => {
      const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
      const p = profiles.find(p => p.id === otherId);
      if (!p) return null;
      return {
        id: p.id, username: p.username, aura_tier: p.aura_tier,
        spirit_score: p.spirit_score,
        attributes: { luck: p.luck, wealth: p.wealth, love: p.love, career: p.career, energy: p.energy },
        daily_streak: p.daily_streak ?? 0,
        friendship_id: f.id, status: f.status, is_requester: f.user_id === user.id,
      };
    }).filter(Boolean) as FriendRow[];
    setFriends(rows.filter(r => r.status === 'accepted'));
    setPending(rows.filter(r => r.status === 'pending'));
    setLoading(false);
  }, [supabase, user.id]);

  useEffect(() => { load(); }, [load]);

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from('profiles').select('id,username,aura_tier,spirit_score,daily_streak')
      .ilike('username', `%${search.trim()}%`).neq('id', user.id).limit(10);
    setResults(data ?? []);
    setSearching(false);
  };

  const sendReq = async (friendId: string) => {
    const { error } = await supabase.from('friendships').insert({ user_id: user.id, friend_id: friendId, status: 'pending' });
    if (error) { showToast('เกิดข้อผิดพลาด หรือส่งคำขอไปแล้ว'); return; }
    showToast('✅ ส่งคำขอเป็นเพื่อนแล้ว!');
    setResults(prev => prev.filter(r => r.id !== friendId));
  };

  const acceptReq = async (fid: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', fid);
    showToast('✅ เพิ่มเพื่อนสำเร็จ!'); load();
  };

  const remove = async (fid: string) => {
    await supabase.from('friendships').delete().eq('id', fid);
    showToast('ลบเพื่อนแล้ว'); load();
  };

  const incoming = pending.filter(p => !p.is_requester);

  return (
    <div className="pb-nav flex flex-col gap-4 pt-2">
      <div>
        <h1 className="text-2xl font-black text-foreground">เพื่อน 👥</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">ดูสถานะพลังงานของเพื่อน</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        {[{ id: 'friends', label: `เพื่อน (${friends.length})` }, { id: 'search', label: 'ค้นหา' }].map(t => (
          <button key={t.id} onClick={() => setView(t.id as any)}
            className="flex-1 rounded-2xl py-2.5 text-sm font-bold transition-all"
            style={view === t.id
              ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,.3)' }
              : { background: 'white', color: '#71717A', border: '1.5px solid #E4E4E7', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="rounded-3xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-foreground">คำขอเพื่อน ({incoming.length})</p>
          <div className="flex flex-col gap-2">
            {incoming.map(f => (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl p-2" style={{ background: '#F5F3FF' }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full font-black text-sm"
                  style={{ background: `${getTierColor(f.aura_tier)}18`, border: `2px solid ${getTierColor(f.aura_tier)}`, color: getTierColor(f.aura_tier) }}>
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{f.username}</p>
                  <p className="text-xs text-muted-foreground">{getTierEmoji(f.aura_tier)} {f.aura_tier}</p>
                </div>
                <button onClick={() => acceptReq(f.friendship_id)}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ background: '#7C3AED', border: 'none', cursor: 'pointer' }}>
                  <UserCheck size={13}/> ยืนยัน
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {view === 'friends' && (
        loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-3xl bg-secondary" style={{ animation: 'pulseSoft 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-bold text-muted-foreground">ยังไม่มีเพื่อน</p>
            <p className="mt-1 text-sm text-muted-foreground" style={{ opacity: .6 }}>ค้นหาเพื่อนเพื่อดูสถานะพลังงาน</p>
            <button onClick={() => setView('search')}
              className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: '#7C3AED', border: 'none', cursor: 'pointer' }}>
              ค้นหาเพื่อน
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map(f => {
              const tc = getTierColor(f.aura_tier);
              return (
                <div key={f.id} className="rounded-3xl bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full font-black text-lg flex-shrink-0"
                      style={{ background: `${tc}18`, border: `2.5px solid ${tc}`, color: tc, boxShadow: `0 0 16px ${tc}30` }}>
                      {f.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{f.username}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {getTierEmoji(f.aura_tier)} {f.aura_tier}
                        {f.daily_streak >= 3 && <span>· 🔥{f.daily_streak}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">{parseFloat(String(f.spirit_score)).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Spirit</p>
                    </div>
                  </div>
                  {/* Mini attr bars */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {(Object.entries(f.attributes) as [keyof UserAttributes, number][]).map(([k, v]) => {
                      const c = ATTR_CONFIG[k];
                      return (
                        <div key={k} className="text-center">
                          <span className="text-base">{c.emoji}</span>
                          <p className="text-xs font-black mt-0.5" style={{ color: c.color }}>{v}</p>
                          <div className="h-1.5 w-full rounded-full mt-1" style={{ background: '#F4F4F5', overflow: 'hidden' }}>
                            <div className="h-full rounded-full" style={{ width: `${v}%`, background: c.gradient }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => remove(f.friendship_id)}
                    className="mt-3 w-full rounded-xl py-1.5 text-xs font-bold flex items-center justify-center gap-1"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer' }}>
                    <X size={12}/> ลบเพื่อน
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Search */}
      {view === 'search' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="ค้นหาชื่อผู้เล่น..."
                style={{ width: '100%', padding: '12px 16px 12px 38px', borderRadius: 14, border: '2px solid #E4E4E7', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button onClick={doSearch} disabled={searching}
              style={{ padding: '12px 18px', borderRadius: 14, background: '#7C3AED', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 70 }}>
              {searching ? '...' : 'ค้นหา'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {results.map(r => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-sm"
                  style={{ background: `${getTierColor(r.aura_tier)}18`, border: `2px solid ${getTierColor(r.aura_tier)}`, color: getTierColor(r.aura_tier) }}>
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{r.username}</p>
                  <p className="text-xs text-muted-foreground">{getTierEmoji(r.aura_tier)} {r.aura_tier} · {parseFloat(r.spirit_score).toFixed(1)} pts</p>
                </div>
                <button onClick={() => sendReq(r.id)}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ background: '#7C3AED', border: 'none', cursor: 'pointer' }}>
                  <UserPlus size={13}/> เพิ่ม
                </button>
              </div>
            ))}
            {results.length === 0 && search && !searching && (
              <p className="py-8 text-center text-sm text-muted-foreground">ไม่พบผู้เล่นชื่อนี้</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
