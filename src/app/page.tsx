import React from 'react';
import Link from 'next/link';
import {
  Sparkles, QrCode, BarChart3, Smartphone, Zap,
  ArrowRight, ShieldCheck, Heart, X, Check
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF6] text-slate-800 select-none font-sans flex flex-col relative overflow-hidden">
      {/* Premium organic warm gradient glow background nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/35 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[-10%] w-[700px] h-[700px] bg-emerald-100/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-teal-50/20 rounded-full blur-[130px] pointer-events-none" />

      {/* 1. NAVIGATION HEADER */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between w-full">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">
              QRCup
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-emerald-500/10"
            >
              เริ่มใช้งานฟรี
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-6 py-20 sm:py-28 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 relative">
        {/* Simple & Fast Badge */}
        <span className="inline-flex items-center gap-1.5 bg-slate-100/70 text-slate-600 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>สแกนง่าย ได้หน้าร้านเดิม ไม่ต้องปริ้นท์ใหม่</span>
        </span>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight">
          ปริ้นท์ป้ายคิวอาร์ครั้งเดียว <br />
          <span className="text-emerald-700 block mt-3">
            เปลี่ยนลิงก์ปลายทางได้ตลอดชีพ
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl leading-relaxed font-normal">
          ไม่ต้องสั่งพิมพ์ป้ายใหม่เมื่อย้ายหน้าร้าน สแกนแล้วเด้งเข้าแอปหลัก (TikTok, Shopee, IG, LINE) ทันที ไม่มีค้างในหน้าแชท LINE ให้เสียลูกค้า
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
          >
            เริ่มสร้างคิวอาร์โค้ดฟรี →
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 border border-slate-400 text-slate-700 font-semibold rounded-full text-sm flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            ดูราคาแพ็กเกจ
          </a>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="px-6 py-24 bg-white w-full border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">3 ขั้นตอนง่ายๆ ในการใช้งาน</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              ประหยัดแรง ประหยัดต้นทุน เริ่มต้นใช้งานได้ในเวลาเพียง 1 นาที
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 px-6 py-10 bg-[#FCFAF6] border border-slate-100 rounded-3xl shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg shadow-sm">
                1
              </div>
              <h3 className="font-bold text-slate-800 text-base">ขั้นตอนที่ 1: ใส่ลิงก์ของคุณ</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                นำลิงก์ร้านค้า TikTok, Shopee, IG หรือ LINE มาใส่ในระบบ QRCup
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 px-6 py-10 bg-[#FCFAF6] border border-slate-100 rounded-3xl shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg shadow-sm">
                2
              </div>
              <h3 className="font-bold text-slate-800 text-base">ขั้นตอนที่ 2: ปริ้นท์ป้ายหน้าร้าน</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                ออกแบบสี ใส่โลโก้ แล้วดาวน์โหลดไฟล์ไปพิมพ์แปะหน้าร้านหรือโพสต์ออนไลน์
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 px-6 py-10 bg-[#FCFAF6] border border-slate-100 rounded-3xl shadow-sm transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg shadow-sm">
                3
              </div>
              <h3 className="font-bold text-slate-800 text-base">ขั้นตอนที่ 3: ปรับเปลี่ยนได้ตลอดเวลา</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                เมื่อต้องการเปลี่ยนลิงก์ปลายทาง แค่มากดอัปเดตในระบบ โดยที่ป้ายคิวอาร์เดิมยังใช้สแกนได้ปกติ ไม่ต้องปริ้นท์ใหม่ตลอดไป
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE BENEFITS SECTION */}
      <section className="px-6 py-24 bg-[#FCFAF6]/60 w-full border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">สแกนง่าย ได้ลูกค้าเพิ่มขึ้น</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              เพิ่มอัตราการปิดการขายด้วยเทคโนโลยีลิงก์อัจฉริยะที่ออกแบบมาเพื่อร้านค้าไทยโดยเฉพาะ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-100/80 p-8 rounded-3xl space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/40 rounded-2xl flex items-center justify-center shadow-sm">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">สแกนทะลุ LINE เข้าแอปทันที</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  หมดปัญหาลูกค้าสแกนคิวอาร์ใน LINE แล้วระบบค้าง หน้าเว็บจะถูกบังคับให้เปิดใน Safari หรือ Chrome เพื่อดีดเข้าแอปช้อปปิ้งที่ลูกค้าล็อกอินไว้แล้วทันที ซื้อง่ายขึ้น ยอดขายไม่สะดุด
                </p>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider block pt-4 transition-transform group-hover:translate-x-1">สแกนทะลุ LINE Sandbox →</span>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-100/80 p-8 rounded-3xl space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/40 rounded-2xl flex items-center justify-center shadow-sm">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">ประหยัดค่าโรงพิมพ์ 100%</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  ไม่ต้องเสียเงิน เสียเวลา จ้างกราฟิกออกแบบและสั่งพิมพ์ป้ายไวนิลหรือเมนูใหม่ทุกครั้งที่ลิงก์เปลี่ยน ป้ายเดิมอันเดียวใช้ได้ชั่วนิรันดร์
                </p>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider block pt-4 transition-transform group-hover:translate-x-1">เซฟเงินค่าพิมพ์ป้าย →</span>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-100/80 p-8 rounded-3xl space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/40 rounded-2xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">รู้ลึกทุกสถิติหลังบ้าน</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  เช็คยอดคนสแกนรายวัน รู้ทันทีว่าลูกค้าชอบสแกนช่วงเวลาไหน และใช้มือถือรุ่นอะไร เพื่อนำไปวางแผนทำการตลาดต่อได้อย่างแม่นยำ
                </p>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider block pt-4 transition-transform group-hover:translate-x-1">ดูสถิติได้เรียลไทม์ →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="px-6 py-24 bg-white w-full border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">แผนราคา</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              เลือกแพ็กเกจที่เหมาะกับระดับการเติบโตของธุรกิจคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Tier */}
            <div className="bg-[#FCFAF6] border border-slate-200/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-sm transition-all hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">แผนเริ่มต้น (Free)</h3>
                  <p className="text-[11px] text-slate-400">สำหรับบุคคลทั่วไปและผู้เริ่มต้นทดลองระบบ</p>
                </div>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-extrabold text-slate-800">฿0</span>
                  <span className="text-[11px] text-slate-400 font-semibold">/ ตลอดชีพ</span>
                </div>
                <ul className="space-y-2.5 text-[11px] text-slate-650 pt-3 border-t border-slate-200/40">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>สร้างคิวอาร์โค้ดได้สูงสุด <strong>3 ลิงก์</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>ปรับเปลี่ยนลิงก์ปลายทางได้ตลอดเวลา</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>ระบบเปิดเบราว์เซอร์หลักของ LINE ป้องกันค้างหน้าแชท</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>ไม่สามารถปรับแต่งสีหรืออัปโหลดโลโก้</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>ไม่รองรับการเด้งเข้าแอปหลักตรงๆ (Shopee, IG, TikTok)</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>ไม่สามารถเข้าถึงระบบวิเคราะห์สถิติเชิงลึก</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-slate-200/80 hover:bg-slate-350 text-slate-700 font-bold rounded-2xl text-center text-xs transition-colors"
              >
                เริ่มต้นใช้งานฟรี
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="bg-[#FCFAF6] border border-slate-200/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-sm transition-all hover:shadow-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Pro รายเดือน</h3>
                  <p className="text-[11px] text-slate-400">ควบคุมเต็มระบบ ปลดล็อกขีดจำกัดสำหรับธุรกิจ</p>
                </div>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl font-extrabold text-slate-800">฿129</span>
                  <span className="text-[11px] text-slate-400 font-semibold">/ เดือน</span>
                </div>
                <ul className="space-y-2.5 text-[11px] text-slate-650 pt-3 border-t border-slate-200/40">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>สร้างคิวอาร์โค้ดได้<strong>ไม่จำกัดจำนวน (Unlimited)</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>ปรับเปลี่ยนลิงก์ปลายทางได้ตลอดเวลา</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>ดาวน์โหลดไฟล์ความละเอียดสูงสำหรับพิมพ์ป้าย (PNG, SVG)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><strong>ปรับแต่งดีไซน์เต็มระบบ</strong> (เลือกสี + อัปโหลดโลโก้ตรงกลาง)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><strong>ระบบเด้งเข้าแอปหลักตรงๆ</strong> (Shopee, Lazada, TikTok, IG)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><strong>วิเคราะห์พฤติกรรมการสแกนเชิงลึก</strong> แบบเรียลไทม์</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl text-center text-xs transition-colors"
              >
                สมัครสมาชิก Pro รายเดือน
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-8 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-lg shadow-emerald-500/5 transition-all hover:scale-[1.01]">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-bl-xl">
                แนะนำ คุ้มสุด! (เซฟ 36%)
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    Pro รายปี 🔥
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-400">ประหยัดสูงสุด 36% คุ้มค่าระยะยาวที่สุด</p>
                </div>
                <div className="space-y-0.5 pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-emerald-600">฿990</span>
                    <span className="text-[11px] text-slate-400 font-semibold">/ ปี</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block">เฉลี่ยเพียง ฿82.5 / เดือน</span>
                </div>
                <ul className="space-y-2.5 text-[11px] text-slate-650 pt-3 border-t border-slate-200/40">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><strong>ฟีเจอร์ระดับ Pro ครบครันทุกอย่าง</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>ถูกลงกว่าถึง 36%</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-center text-xs transition-all active:scale-95 shadow-sm shadow-emerald-500/10"
              >
                สมัครสมาชิก Pro รายปี คุ้มที่สุด
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-250/20 bg-slate-100/50 py-10 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} QRCup (คิวอาร์คัพ). All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>สร้างสำหรับธุรกิจและครีเอเตอร์ชาวไทย</span>
            <Heart className="w-3.5 h-3.5 text-rose-500/80 fill-rose-500/20" />
          </div>
        </div>
      </footer>
    </div>
  );
}
