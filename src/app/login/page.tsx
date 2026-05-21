'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Sparkles, AlertTriangle, ArrowRight, Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login');

  const supabase = getSupabaseClient();

  // Automatic Cookie Sync on Auth State Change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Serialize access token to standard secure cookie for server RLS queries
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        router.push('/dashboard');
      } else {
        // Clear cookie on logout
        document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('กรุณากรอกที่อยู่อีเมลของคุณ');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'magic') {
        // 1. Passwordless Magic Link
        const { error: magicErr } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (magicErr) throw magicErr;
        setMessage('ตรวจสอบกล่องข้อความของคุณ! เราได้ส่งลิงก์เข้าสู่ระบบ (Magic Link) แบบปลอดภัยไปให้เรียบร้อยแล้ว');
      } else if (mode === 'login') {
        // 2. Email & Password Login
        const { error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (loginErr) throw loginErr;
        // Redirect handled by onAuthStateChange hook
      } else {
        // 3. Email & Password Signup
        if (password.length < 6) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        const { error: signupErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (signupErr) throw signupErr;
        setMessage('สมัครสมาชิกสำเร็จแล้ว! กรุณาตรวจสอบกล่องข้อความอีเมลเพื่อยืนยันบัญชี หรือเข้าสู่ระบบด้านล่าง');
      }
    } catch (err: unknown) {
      console.error('Authentication failed:', err);
      const errMsg = err instanceof Error ? err.message : 'การยืนยันตัวตนล้มเหลว กรุณาตรวจสอบข้อมูลหรือรหัสผ่านของคุณอีกครั้ง';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative px-4 overflow-hidden select-none">
      {/* Background Neon Glow Nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Form container */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-emerald-500/5 pointer-events-none" />
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8 relative">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-400 p-0.5 flex items-center justify-center mx-auto shadow-lg shadow-lime-400/20">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            <Link href="/" className="hover:text-lime-400 transition-colors">
              เข้าสู่ระบบ QRCup (คิวอาร์คัพ)
            </Link>
          </h2>
          <p className="text-sm text-slate-500">ระบบจัดการคิวอาร์โค้ดสำหรับร้านค้า ครีเอเตอร์ และ SMEs</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-start gap-3 mb-5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs flex items-start gap-3 mb-5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Form controls */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">ที่อยู่อีเมล</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-lime-400 rounded-2xl pl-12 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400/10 transition-all text-sm"
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">รหัสผ่าน</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 focus:border-lime-400 rounded-2xl pl-12 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400/10 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'เข้าสู่ระบบ' : mode === 'signup' ? 'สร้างบัญชีผู้ใช้ใหม่' : 'ส่งลิงก์เข้าสู่ระบบ (Magic Link)'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Tab Toggle Switchers */}
        <div className="flex flex-col items-center gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('magic')} className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
                เข้าสู่ระบบด้วย Magic Link (ไม่ต้องใช้รหัสผ่าน)
              </button>
              <span className="text-slate-600">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button onClick={() => setMode('signup')} className="text-slate-300 hover:text-slate-100 font-semibold transition-colors">
                  สร้างบัญชีฟรีที่นี่
                </button>
              </span>
            </>
          )}

          {mode === 'signup' && (
            <span className="text-slate-600">
              มีบัญชีผู้ใช้แล้วใช่หรือไม่?{' '}
              <button onClick={() => setMode('login')} className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
                เข้าสู่ระบบ
              </button>
            </span>
          )}

          {mode === 'magic' && (
            <>
              <button onClick={() => setMode('login')} className="text-lime-400 hover:text-lime-300 font-semibold transition-colors">
                เข้าสู่ระบบด้วยรหัสผ่านแทน
              </button>
              <span className="text-slate-600">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button onClick={() => setMode('signup')} className="text-slate-300 hover:text-slate-100 font-semibold transition-colors">
                  สร้างบัญชีฟรีที่นี่
                </button>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

