'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim() || username.length < 3) {
          setError('Username must be at least 3 characters');
          return;
        }
        // Check username availability
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .single();

        if (existing) {
          setError('Username already taken. Choose another.');
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
          },
        });

        if (signUpError) throw signUpError;
        setSuccess('Check your email to confirm your account!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 stars-bg opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(123,47,190,0.1) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-4xl mb-3 animate-float"
              style={{ filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.4))' }}>✦</div>
            <h1 className="font-cinzel font-black text-2xl">
              <span className="gold-text">SPIRIT</span>
              <span className="text-oracle-light"> STATUS</span>
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="spirit-card rounded-3xl p-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-cinzel tracking-wide transition-all duration-200"
                style={mode === m ? {
                  background: 'linear-gradient(135deg, rgba(123,47,190,0.6), rgba(45,27,105,0.8))',
                  color: '#E8D5A3',
                  borderRadius: '10px',
                } : { color: 'rgba(232,213,163,0.4)' }}
              >
                {m === 'login' ? 'Sign In' : 'Join Now'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-cinzel tracking-wider text-oracle-light/60 mb-1.5">
                  Spirit Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="your_spirit_name"
                  className="w-full px-4 py-3 rounded-xl text-oracle-light text-sm outline-none transition-all duration-200 focus:ring-1"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(123,47,190,0.3)',
                    '--tw-ring-color': 'rgba(201,168,76,0.5)',
                  } as React.CSSProperties}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-cinzel tracking-wider text-oracle-light/60 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mystic@example.com"
                className="w-full px-4 py-3 rounded-xl text-oracle-light text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(123,47,190,0.3)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel tracking-wider text-oracle-light/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl text-oracle-light text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(123,47,190,0.3)',
                }}
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center py-2 px-3 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-400 text-xs text-center py-2 px-3 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-cinzel font-bold text-sm tracking-wider transition-all duration-300 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #7B2FBE, #C9A84C)',
                color: 'white',
                boxShadow: '0 0 20px rgba(123,47,190,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {mode === 'signup' ? 'Creating your spirit...' : 'Entering the realm...'}
                </span>
              ) : mode === 'signup' ? '✦ Begin Your Journey' : 'Enter the Realm →'}
            </button>
          </div>
        </div>

        <p className="text-center text-oracle-light/30 text-xs mt-4 font-cinzel">
          One draw per day. May the stars guide you.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-oracle-gold animate-pulse font-cinzel">Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}
