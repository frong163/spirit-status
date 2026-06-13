'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTierColor, getTierEmoji, ATTR_CONFIG } from '@/lib/game';
import type { TabProps } from './types';
import type { AuraTier, UserAttributes } from '@/types';

interface Friend {
  id: string;
  username: string;
  aura_tier: AuraTier;
  spirit_score: number;
  attributes: UserAttributes;
  daily_streak: number;
  friendship_id: string;
  status: string;
  is_requester: boolean;
}

export default function FriendsTab({ user, showToast }: TabProps) {
  const supabase = createClient();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<Friend[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState<'friends'|'search'>('friends');

  const loadFriends = async () => {
    setLoading(true);
    const { data: fships } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (!fships) { setLoading(false); return; }

    const ids = fships.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
    if (ids.length === 0) { setLoading(false); return; }

    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
    if (!profiles) { setLoading(false); return; }

    const enriched: Friend[] = fships.map(f => {
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
    }).filter(Boolean) as Friend[];

    setFriends(enriched.filter(f => f.status === 'accepted'));
    setPending(enriched.filter(f => f.status === 'pending'));
    setLoading(false);
  };

  useEffect(() => { loadFriends(); }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from('profiles').select('id,username,aura_tier,spirit_score,daily_streak')
      .ilike('username', `%${search.trim()}%`).neq('id', user.id).limit(10);
    setSearchResults(data ?? []);
    setSearching(false);
  };

  const sendRequest = async (friendId: string) => {
    const { error } = await supabase.from('friendships').insert({ user_id: user.id, friend_id: friendId, status: 'pending' });
    if (error) { showToast('เกิดข้อผิดพลาด หรืออาจส่งคำขอไปแล้ว'); return; }
    showToast('✅ ส่งคำขอเป็นเพื่อนแล้ว!');
    setSearchResults(prev => prev.filter(r => r.id !== friendId));
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    showToast('✅ เพิ่มเพื่อนสำเร็จ!');
    loadFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    showToast('ลบเพื่อนแล้ว');
    loadFriends();
  };

  return (
    <div className="space-y-4 animate-fadeInUp">
      <div>
        <h2 className="text-xl font-extrabold" style={{ color: '#1E1B4B' }}>เพื่อน</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>ดูสถานะพลังงานของเพื่อน</p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('friends')}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={view === 'friends' ? { background: '#7C3AED', color: 'white' } : { background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}>
          เพื่อน ({friends.length})
        </button>
        <button onClick={() => setView('search')}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={view === 'search' ? { background: '#7C3AED', color: 'white' } : { background: 'white', color: '#6B7280', border: '1px solid #E5E7EB' }}>
          ค้นหาเพื่อน
        </button>
      </div>

      {/* Pending requests */}
      {pending.filter(p => !p.is_requester).length > 0 && (
        <div className="card p-4">
          <div className="font-semibold text-sm mb-3" style={{ color: '#1E1B4B' }}>
            คำขอเพื่อน ({pending.filter(p => !p.is_requester).length})
          </div>
          <div className="space-y-2">
            {pending.filter(p => !p.is_requester).map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: '#F8F7FF' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: getTierColor(f.aura_tier) + '20', color: getTierColor(f.aura_tier) }}>
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: '#1E1B4B' }}>{f.username}</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>{getTierEmoji(f.aura_tier)} {f.aura_tier}</div>
                </div>
                <button onClick={() => acceptRequest(f.friendship_id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: '#7C3AED' }}>ยืนยัน</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'friends' && (
        <>
          {loading ? (
            <div className="space-y-2">
              {Array.from({length:3}).map((_,i) => <div key={i} className="h-20 rounded-xl animate-pulse" style={{background:'#F3F4F6'}} />)}
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">👥</div>
              <p className="font-semibold" style={{ color: '#9CA3AF' }}>ยังไม่มีเพื่อน</p>
              <p className="text-sm mt-1" style={{ color: '#D1D5DB' }}>ค้นหาเพื่อนเพื่อดูสถานะพลังงาน</p>
              <button onClick={() => setView('search')} className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#7C3AED' }}>
                ค้นหาเพื่อน
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map(f => {
                const tc = getTierColor(f.aura_tier);
                return (
                  <div key={f.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{ background: tc + '20', border: `2px solid ${tc}`, color: tc }}>
                        {f.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold" style={{ color: '#1E1B4B' }}>{f.username}</div>
                        <div className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: '#9CA3AF' }}>
                          <span>{getTierEmoji(f.aura_tier)} {f.aura_tier}</span>
                          {f.daily_streak >= 3 && <span>🔥{f.daily_streak}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color: '#7C3AED' }}>{parseFloat(f.spirit_score.toString()).toFixed(1)}</div>
                        <div className="text-xs" style={{ color: '#9CA3AF' }}>Spirit</div>
                      </div>
                    </div>
                    {/* Mini attribute bars */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {(Object.entries(f.attributes) as [keyof UserAttributes, number][]).map(([k, v]) => {
                        const c = ATTR_CONFIG[k];
                        return (
                          <div key={k} className="text-center">
                            <div className="text-sm">{c.emoji}</div>
                            <div className="text-xs font-bold mt-0.5" style={{ color: c.color }}>{v}</div>
                            <div className="progress-bar mt-1" style={{ height: 4 }}>
                              <div className="progress-fill" style={{ width: `${v}%`, background: c.gradient, height: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => removeFriend(f.friendship_id)}
                      className="mt-3 text-xs w-full py-1.5 rounded-lg" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                      ลบเพื่อน
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'search' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ค้นหาชื่อผู้เล่น..." className="input-field flex-1" />
            <button onClick={handleSearch} disabled={searching}
              className="px-4 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: '#7C3AED', minWidth: 72 }}>
              {searching ? '...' : 'ค้นหา'}
            </button>
          </div>

          <div className="space-y-2">
            {searchResults.map(r => (
              <div key={r.id} className="card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: getTierColor(r.aura_tier) + '20', color: getTierColor(r.aura_tier) }}>
                  {r.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: '#1E1B4B' }}>{r.username}</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>{getTierEmoji(r.aura_tier)} {r.aura_tier} • {parseFloat(r.spirit_score).toFixed(1)} pts</div>
                </div>
                <button onClick={() => sendRequest(r.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: '#7C3AED' }}>+ เพิ่ม</button>
              </div>
            ))}
            {searchResults.length === 0 && search && !searching && (
              <div className="text-center py-8" style={{ color: '#9CA3AF' }}>ไม่พบผู้เล่นชื่อนี้</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
