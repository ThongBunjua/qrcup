'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function InactiveContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'คิวอาร์โค้ด';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Backlight glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Warning Card */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 p-0.5 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">คิวอาร์โค้ดปิดใช้งานชั่วคราว</h1>
          <span className="inline-block bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-slate-400 px-3 py-1 rounded-full mt-1">
            รหัส: {title}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          เจ้าของคิวอาร์โค้ดนี้ได้ระงับการเชื่อมต่อลิงก์ไว้ชั่วคราว หากคุณเป็นเจ้าของคิวอาร์โค้ดนี้ กรุณาเข้าสู่ระบบควบคุม QRCup (คิวอาร์คัพ) เพื่อเปิดใช้งานตัวจัดการลิงก์อีกครั้ง
        </p>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-800/85 space-y-3 font-sans">
          <Link
            href="/login"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/5 transition-all"
          >
            เข้าสู่ระบบสำหรับเจ้าของ
          </Link>
          
          <Link
            href="/"
            className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับไปหน้าหลัก QRCup (คิวอาร์คัพ)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InactivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
    }>
      <InactiveContent />
    </Suspense>
  );
}
