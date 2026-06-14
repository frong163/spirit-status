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
        // Validate
        if (username.trim().length < 3) { setError('ชื่อต้องมีอย่างน้อย 3 ตัวอักษร'); setLoading(false); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('ชื่อใช้ได้แค่ a-z, 0-9, _ เท่านั้น'); setLoading(false); return; }
        if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); setLoading(false); return; }

        // Check username taken
        const { data: ex } = await supabase.from('profiles').select('id').eq('username', username.trim()).maybeSingle();
        if (ex) { setError('ชื่อนี้มีคนใช้แล้ว กรุณาเลือกชื่อใหม่'); setLoading(false); return; }

        // Sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: username.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) {
          // Map English errors to Thai
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
            setError('อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบแทน');
          } else if (signUpError.message.includes('invalid email')) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
          } else if (signUpError.message.includes('Password')) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
          } else {
            setError('สมัครไม่สำเร็จ: ' + signUpError.message);
          }
          setLoading(false); return;
        }

        setSuccess('✅ สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมากด "เข้าสู่ระบบ"');

      } else {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('กรุณายืนยันอีเมลก่อน ตรวจสอบกล่องจดหมายของคุณ');
          } else {
            setError(signInError.message);
          }
          setLoading(false); return;
        }

        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#F5F3FF,#EDE9FE)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:400}}>

        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,marginBottom:40,textDecoration:'none'}}>
          <div style={{width:48,height:48,borderRadius:16,background:'linear-gradient(135deg,#7C3AED,#6D28D9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:'0 4px 16px rgba(124,58,237,.4)'}}>✨</div>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:'#18181B',fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>Spirit Status</div>
            <div style={{fontSize:13,color:'#7C3AED',fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>พลังงานดี ชีวิตดีขึ้น</div>
          </div>
        </Link>

        {/* Card */}
        <div style={{background:'white',borderRadius:24,padding:28,boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>

          {/* Mode toggle */}
          <div style={{display:'flex',background:'#F5F3FF',borderRadius:16,padding:4,marginBottom:24}}>
            {(['login','signup'] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('');}}
                style={{
                  flex:1,padding:'10px 0',borderRadius:12,border:'none',cursor:'pointer',
                  fontWeight:700,fontSize:14,fontFamily:'Noto Sans Thai,Inter,sans-serif',
                  transition:'all .2s',
                  background: mode===m ? 'white' : 'transparent',
                  color: mode===m ? '#7C3AED' : '#A1A1AA',
                  boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
                }}>
                {m==='login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {mode==='signup' && (
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:700,color:'#18181B',marginBottom:8,fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>ชื่อในระบบ (Spirit Name)</label>
                <input
                  value={username} onChange={e=>setUsername(e.target.value)}
                  placeholder="เช่น spirit_user123"
                  autoComplete="username"
                  style={{width:'100%',padding:'13px 16px',borderRadius:14,border:'2px solid #E4E4E7',fontSize:15,fontFamily:'Noto Sans Thai,Inter,sans-serif',outline:'none',boxSizing:'border-box'}}
                  onFocus={e=>e.target.style.borderColor='#7C3AED'}
                  onBlur={e=>e.target.style.borderColor='#E4E4E7'}
                />
                <div style={{fontSize:11,color:'#A1A1AA',marginTop:4,fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น</div>
              </div>
            )}

            <div>
              <label style={{display:'block',fontSize:13,fontWeight:700,color:'#18181B',marginBottom:8,fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>อีเมล</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                style={{width:'100%',padding:'13px 16px',borderRadius:14,border:'2px solid #E4E4E7',fontSize:15,fontFamily:'Noto Sans Thai,Inter,sans-serif',outline:'none',boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor='#7C3AED'}
                onBlur={e=>e.target.style.borderColor='#E4E4E7'}
              />
            </div>

            <div>
              <label style={{display:'block',fontSize:13,fontWeight:700,color:'#18181B',marginBottom:8,fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>รหัสผ่าน</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                autoComplete={mode==='login'?'current-password':'new-password'}
                onKeyDown={e=>e.key==='Enter'&&submit()}
                style={{width:'100%',padding:'13px 16px',borderRadius:14,border:'2px solid #E4E4E7',fontSize:15,fontFamily:'Noto Sans Thai,Inter,sans-serif',outline:'none',boxSizing:'border-box'}}
                onFocus={e=>e.target.style.borderColor='#7C3AED'}
                onBlur={e=>e.target.style.borderColor='#E4E4E7'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#DC2626',fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:12,padding:'12px 16px',fontSize:13,color:'#16A34A',fontFamily:'Noto Sans Thai,Inter,sans-serif',lineHeight:1.6}}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submit} disabled={loading}
              style={{
                width:'100%',padding:'15px',borderRadius:16,border:'none',cursor:loading?'not-allowed':'pointer',
                background:'linear-gradient(135deg,#7C3AED,#6D28D9)',
                color:'white',fontSize:16,fontWeight:800,
                fontFamily:'Noto Sans Thai,Inter,sans-serif',
                boxShadow:'0 6px 20px rgba(124,58,237,.4)',
                opacity:loading?0.7:1,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                transition:'all .2s',
              }}>
              {loading ? '⏳ กำลังดำเนินการ...' : mode==='signup' ? '✨ สร้างบัญชีฟรี' : 'เข้าสู่ระบบ →'}
            </button>
          </div>
        </div>

        <p style={{textAlign:'center',fontSize:12,color:'#A1A1AA',marginTop:20,fontFamily:'Noto Sans Thai,Inter,sans-serif'}}>
          ฟรีตลอดไป · ไม่ต้องใช้บัตรเครดิต
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F5F3FF'}}>
        <div style={{fontSize:32}}>✨</div>
      </div>
    }>
      <LoginForm/>
    </Suspense>
  );
}
