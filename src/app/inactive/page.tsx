'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function InactiveContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'คิวอาร์โค้ด';

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-slate-800 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Premium organic warm gradient glow background nodes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-100/35 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/25 rounded-full blur-[100px] pointer-events-none" />

      {/* Warning Card */}
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-sm relative text-center space-y-6 z-10">
        
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/50 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">คิวอาร์โค้ดปิดใช้งานชั่วคราว</h1>
          <span className="inline-block bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-500 px-3 py-1 rounded-full mt-1">
            รหัส: {title}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          เจ้าของคิวอาร์โค้ดนี้ได้ระงับการเชื่อมต่อลิงก์ไว้ชั่วคราว หากคุณเป็นเจ้าของคิวอาร์โค้ดนี้ กรุณาเข้าสู่ระบบควบคุม QRCup (คิวอาร์คัพ) เพื่อเปิดใช้งานตัวจัดการลิงก์อีกครั้ง
        </p>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-100 space-y-3 font-sans">
          <Link
            href="/login"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-amber-500/10 active:scale-95 transition-all cursor-pointer"
          >
            เข้าสู่ระบบสำหรับเจ้าของ
          </Link>
          
          <Link
            href="/"
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
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
      <div className="min-h-screen bg-[#FCFAF6] text-slate-800 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
      </div>
    }>
      <InactiveContent />
    </Suspense>
  );
}
