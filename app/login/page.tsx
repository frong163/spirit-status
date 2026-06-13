'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login'|'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (username.length < 3) { setError('ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'); return; }
        const { data: ex } = await supabase.from('profiles').select('id').eq('username', username.trim()).single();
        if (ex) { setError('ชื่อนี้ถูกใช้แล้ว กรุณาเลือกชื่อใหม่'); return; }
        const { error: e } = await supabase.auth.signUp({ email, password, options: { data: { username: username.trim() } } });
        if (e) throw e;
        setSuccess('ตรวจสอบอีเมลเพื่อยืนยันบัญชี!');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-5" style={{ background: 'linear-gradient(160deg, #F8F7FF, #EDE9FE)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-4xl mb-2">✨</div>
            <div className="font-bold text-xl" style={{ color: '#1E1B4B' }}>Spirit Status</div>
            <div className="text-sm" style={{ color: '#7C3AED' }}>พลังงานดี ชีวิตดีขึ้น</div>
          </Link>
        </div>

        <div className="card p-6">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-5 p-1" style={{ background: '#F3F4F6' }}>
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={mode === m ? { background: 'white', color: '#7C3AED', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: '#6B7280' }}>
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>ชื่อในระบบ (Spirit Name)</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="your_spirit_name" className="input-field" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>อีเมล</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>รหัสผ่าน</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="input-field" />
            </div>

            {error && <div className="text-sm text-center py-2.5 px-3 rounded-xl" style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</div>}
            {success && <div className="text-sm text-center py-2.5 px-3 rounded-xl" style={{ background: '#DCFCE7', color: '#16A34A' }}>{success}</div>}

            <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {mode === 'signup' ? 'กำลังสร้างบัญชี...' : 'กำลังเข้าสู่ระบบ...'}
                </span>
              ) : mode === 'signup' ? '✨ เริ่มต้นฟรี' : 'เข้าสู่ระบบ →'}
            </button>
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: '#9CA3AF' }}>จั่วไพ่ได้วันละ 1 ครั้ง • ฟรีตลอดไป</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(160deg,#F8F7FF,#EDE9FE)'}}>
      <div className="text-purple animate-pulse font-semibold">กำลังโหลด...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}
