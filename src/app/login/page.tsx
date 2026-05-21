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
        // Safe Secure Cookie flag conditional (Secure only on HTTPS, allowing HTTP local/network testing)
        const isSecure = window.location.protocol === 'https:' ? 'Secure;' : '';
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800; SameSite=Lax; ${isSecure}`;
        
        // Trigger a hard redirect instead of soft route push to guarantee immediate cookie header propagation
        window.location.href = '/dashboard';
      } else {
        // Clear cookie on logout
        const isSecure = window.location.protocol === 'https:' ? 'Secure;' : '';
        document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax; ${isSecure}`;
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
            emailRedirectTo: `${window.location.origin}/login`
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
            emailRedirectTo: `${window.location.origin}/login`
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: googleErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      if (googleErr) throw googleErr;
    } catch (err: unknown) {
      console.error('Google authentication failed:', err);
      const errMsg = err instanceof Error ? err.message : 'ไม่สามารถเข้าสู่ระบบผ่านบัญชี Google ได้';
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] flex flex-col justify-center items-center relative px-4 overflow-hidden select-none">
      {/* Premium organic warm gradient glow background nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-100/35 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/25 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Form container */}
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-sm relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8 relative">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <span className="font-extrabold text-3xl tracking-tight text-slate-800">
              QRCup
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            เข้าสู่ระบบ QRCup (คิวอาร์คัพ)
          </h2>
          <p className="text-xs text-slate-450 leading-relaxed">ระบบจัดการคิวอาร์โค้ดสำหรับร้านค้า ครีเอเตอร์ และ SMEs</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-650 p-4 rounded-2xl text-xs flex items-start gap-3 mb-5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs flex items-start gap-3 mb-5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        {/* Form controls */}
        {/* Sleek Google Button */}
        <div className="space-y-4 mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.76 14.93 1 12 1 7.24 1 3.22 3.74 1.3 7.73l3.77 2.92C6.01 7.24 8.79 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.48-1.12 2.73-2.38 3.58v2.97h3.84c2.25-2.07 3.59-5.12 3.59-8.64z" />
              <path fill="#FBBC05" d="M5.07 10.65c-.25-.73-.39-1.51-.39-2.32s.14-1.59.39-2.32L1.3 7.09C.47 8.75 0 10.59 0 12.5s.47 3.75 1.3 5.41l3.77-2.92c-.25-.73-.39-1.51-.39-2.32z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.84-2.97c-1.07.72-2.44 1.15-4.12 1.15-3.21 0-5.99-2.2-6.96-5.61l-3.77 2.92C3.22 20.26 7.24 23 12 23z" />
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-wider uppercase">หรือ</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">ที่อยู่อีเมล</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FCFAF6] border border-slate-200 hover:border-slate-350 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-normal"
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">รหัสผ่าน</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCFAF6] border border-slate-200 hover:border-slate-350 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-normal"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
        <div className="flex flex-col items-center gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('magic')} className="text-emerald-650 hover:text-emerald-700 font-semibold transition-colors cursor-pointer">
                เข้าสู่ระบบด้วย Magic Link (ไม่ต้องใช้รหัสผ่าน)
              </button>
              <span className="text-slate-450">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button onClick={() => setMode('signup')} className="text-slate-600 hover:text-slate-800 font-semibold transition-colors cursor-pointer">
                  สร้างบัญชีฟรีที่นี่
                </button>
              </span>
            </>
          )}

          {mode === 'signup' && (
            <span className="text-slate-450">
              มีบัญชีผู้ใช้แล้วใช่หรือไม่?{' '}
              <button onClick={() => setMode('login')} className="text-emerald-650 hover:text-emerald-700 font-semibold transition-colors cursor-pointer">
                เข้าสู่ระบบ
              </button>
            </span>
          )}

          {mode === 'magic' && (
            <>
              <button onClick={() => setMode('login')} className="text-emerald-650 hover:text-emerald-700 font-semibold transition-colors cursor-pointer">
                เข้าสู่ระบบด้วยรหัสผ่านแทน
              </button>
              <span className="text-slate-450">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button onClick={() => setMode('signup')} className="text-slate-600 hover:text-slate-800 font-semibold transition-colors cursor-pointer">
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

