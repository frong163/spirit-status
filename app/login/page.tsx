'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<'login'|'signup'>(params.get('mode')==='signup'?'signup':'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (username.trim().length < 3) { setError('ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('ชื่อใช้ได้แค่ a-z, 0-9, _'); return; }
        const { data: ex } = await supabase.from('profiles').select('id').eq('username', username.trim()).maybeSingle();
        if (ex) { setError('ชื่อนี้มีคนใช้แล้ว'); return; }
        const { error: e } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { username: username.trim() }, emailRedirectTo: `${window.location.origin}/dashboard` }
        });
        if (e) throw e;
        setSuccess('📧 ตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมา Login ครับ');
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(msg.includes('Invalid') ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : msg);
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col" style={{background:'linear-gradient(180deg,#F5F3FF,#EDE9FE)'}}>
      <div className="max-w-md mx-auto w-full px-4 py-10 flex-1 flex flex-col justify-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',boxShadow:'0 4px 16px rgba(124,58,237,.4)'}}>✨</div>
          <div>
            <div className="font-black text-xl" style={{color:'#18181B'}}>Spirit Status</div>
            <div className="text-sm" style={{color:'#7C3AED'}}>พลังงานดี ชีวิตดีขึ้น</div>
          </div>
        </Link>

        <h2 className="font-black text-2xl mb-1" style={{color:'#18181B'}}>
          {mode==='signup' ? 'เริ่มต้นฟรี ✨' : 'ยินดีต้อนรับกลับ 👋'}
        </h2>
        <p className="text-sm mb-8" style={{color:'#71717A'}}>
          {mode==='signup' ? 'สร้างบัญชีและจั่วไพ่ครั้งแรกของคุณ' : 'เข้าสู่ระบบเพื่อดูพลังงานวันนี้'}
        </p>

        {/* Toggle */}
        <div className="flex p-1 rounded-2xl mb-6" style={{background:'rgba(124,58,237,.08)'}}>
          {(['login','signup'] as const).map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('');}}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={mode===m ? {background:'white',color:'#7C3AED',boxShadow:'0 2px 8px rgba(0,0,0,.08)'} : {color:'#A1A1AA'}}>
              {m==='login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode==='signup' && (
            <div>
              <label className="block text-sm font-bold mb-2" style={{color:'#18181B'}}>ชื่อในระบบ</label>
              <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="เช่น spirit_user123" autoComplete="username"/>
              <div className="text-xs mt-1.5" style={{color:'#A1A1AA'}}>ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#18181B'}}>อีเมล</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" autoComplete="email"/>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{color:'#18181B'}}>รหัสผ่าน</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" onKeyDown={e=>e.key==='Enter'&&submit()} autoComplete={mode==='login'?'current-password':'new-password'}/>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 rounded-2xl text-sm" style={{background:'#FEF2F2',color:'#DC2626'}}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-4 rounded-2xl text-sm" style={{background:'#F0FDF4',color:'#16A34A'}}>
              <span>{success}</span>
            </div>
          )}

          <button onClick={submit} disabled={loading} className="btn btn-primary" style={{marginTop:8}}>
            {loading
              ? <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white anim-spin-fast"/>กำลังดำเนินการ...</>
              : mode==='signup' ? '✨ สร้างบัญชีฟรี' : 'เข้าสู่ระบบ →'
            }
          </button>
        </div>

        <p className="text-center text-xs mt-8" style={{color:'#A1A1AA'}}>
          จั่วไพ่ได้วันละ 1 ครั้ง • ฟรีตลอดไป • ไม่ต้องใช้บัตรเครดิต
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'#F5F3FF'}}><div className="anim-pulse text-2xl">✨</div></div>}>
      <LoginForm/>
    </Suspense>
  );
}
