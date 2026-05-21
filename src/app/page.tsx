import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, QrCode, BarChart3, Smartphone, Zap, 
  ArrowRight, ShieldCheck, Heart, X
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 select-none font-sans flex flex-col">
      {/* 1. NAVIGATION HEADER */}
      <header className="border-b border-slate-900/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-lime-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
            QRCup <span className="text-xs font-normal text-slate-400">(คิวอาร์คัพ)</span>
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link 
            href="/login" 
            className="text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            เริ่มใช้งานฟรี
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-6 py-32 lg:py-48 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 relative">
        {/* Simple & Fast Badge */}
        <span className="inline-flex items-center gap-1.5 bg-slate-900/80 text-slate-350 text-xs font-semibold px-4 py-1.5 rounded-full border border-slate-800/80">
          <Zap className="w-3.5 h-3.5 text-lime-400 shrink-0 animate-pulse" />
          ⚡ ระบบจัดส่งลิงก์อัจฉริยะ โตไว ไม่มีสะดุด
        </span>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
          ปริ้นท์ป้ายคิวอาร์ครั้งเดียว <br />
          <span className="text-lime-400">เปลี่ยนลิงก์ปลายทางได้ตลอดชีพ</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-normal">
          ไม่ต้องสั่งพิมพ์ป้ายใหม่เมื่อย้ายหน้าร้าน สแกนแล้วเด้งเข้าแอปหลัก (TikTok, Shopee, IG, LINE) ทันที ไม่มีค้างในหน้าแชท LINE ให้เสียลูกค้า
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 w-full justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-lime-400/5"
          >
            เริ่มสร้างคิวอาร์โค้ดฟรี →
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 text-slate-350 font-medium rounded-xl text-sm flex items-center justify-center transition-all"
          >
            ดูราคาแพ็กเกจ
          </a>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="px-6 py-28 bg-slate-950 max-w-6xl mx-auto w-full space-y-16 relative border-t border-slate-900/30">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-150">3 ขั้นตอนง่ายๆ ในการใช้งาน</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            ประหยัดแรง ประหยัดต้นทุน เริ่มต้นใช้งานได้ในเวลาเพียง 1 นาที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4 px-4 bg-slate-900/20 border border-slate-900/50 p-8 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-extrabold text-lime-400 text-base shadow-sm">
              1
            </div>
            <h3 className="font-bold text-slate-150 text-base">ขั้นตอนที่ 1: ใส่ลิงก์ของคุณ</h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              นำลิงก์ร้านค้า TikTok, Shopee, IG หรือ LINE มาใส่ในระบบ QRCup
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4 px-4 bg-slate-900/20 border border-slate-900/50 p-8 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-extrabold text-lime-400 text-base shadow-sm">
              2
            </div>
            <h3 className="font-bold text-slate-150 text-base">ขั้นตอนที่ 2: ปริ้นท์ป้ายหน้าร้าน</h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              ออกแบบสี ใส่โลโก้ แล้วดาวน์โหลดไฟล์ไปพิมพ์แปะหน้าร้านหรือโพสต์ออนไลน์
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4 px-4 bg-slate-900/20 border border-slate-900/50 p-8 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-extrabold text-lime-400 text-base shadow-sm">
              3
            </div>
            <h3 className="font-bold text-slate-150 text-base">ขั้นตอนที่ 3: ปรับเปลี่ยนได้ตลอดเวลา</h3>
            <p className="text-xs text-slate-450 leading-relaxed font-normal">
              เมื่อต้องการเปลี่ยนลิงก์ปลายทาง แค่มากดอัปเดตในระบบ โดยที่ป้ายคิวอาร์เดิมยังใช้สแกนได้ปกติ ไม่ต้องปริ้นท์ใหม่ตลอดไป
            </p>
          </div>
        </div>
      </section>

      {/* 4. CORE BENEFITS SECTION */}
      <section className="px-6 py-28 bg-slate-950 max-w-7xl mx-auto w-full space-y-16 relative border-t border-slate-900/30">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-150">สแกนง่าย ได้ลูกค้าเพิ่มขึ้น</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            เพิ่มอัตราการปิดการขายด้วยเทคโนโลยีลิงก์อัจฉริยะที่ออกแบบมาเพื่อร้านค้าไทยโดยเฉพาะ
          </p>
        </div>

        {/* Grid of features - Borderless/ultra-faint bordered cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/20 border border-slate-800/40 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-9 h-9 bg-slate-900 border border-slate-800/60 rounded-lg flex items-center justify-center text-slate-400">
                <Smartphone className="w-4.5 h-4.5 text-lime-400" />
              </div>
              <h3 className="font-bold text-slate-150 text-base">สแกนทะลุ LINE เข้าแอปทันที</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                หมดปัญหาลูกค้าสแกนคิวอาร์ใน LINE แล้วระบบค้าง หน้าเว็บจะถูกบังคับให้เปิดใน Safari หรือ Chrome เพื่อดีดเข้าแอปช้อปปิ้งที่ลูกค้าล็อกอินไว้แล้วทันที ซื้อง่ายขึ้น ยอดขายไม่สะดุด
              </p>
            </div>
            <span className="text-[10px] text-lime-400/80 font-semibold uppercase tracking-wider block pt-4">สแกนทะลุ LINE Sandbox →</span>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/20 border border-slate-800/40 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-9 h-9 bg-slate-900 border border-slate-800/60 rounded-lg flex items-center justify-center text-slate-400">
                <QrCode className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-150 text-base">ประหยัดค่าโรงพิมพ์ 100%</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                ไม่ต้องเสียเงิน เสียเวลา จ้างกราฟิกออกแบบและสั่งพิมพ์ป้ายไวนิลหรือเมนูใหม่ทุกครั้งที่ลิงก์เปลี่ยน ป้ายเดิมอันเดียวใช้ได้ชั่วนิรันดร์
              </p>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-wider block pt-4">เซฟเงินค่าพิมพ์ป้าย →</span>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/20 border border-slate-800/40 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-9 h-9 bg-slate-900 border border-slate-800/60 rounded-lg flex items-center justify-center text-slate-400">
                <BarChart3 className="w-4.5 h-4.5 text-lime-400" />
              </div>
              <h3 className="font-bold text-slate-150 text-base">รู้ลึกทุกสถิติหลังบ้าน</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                เช็คยอดคนสแกนรายวัน รู้ทันทีว่าลูกค้าชอบสแกนช่วงเวลาไหน และใช้มือถือรุ่นอะไร เพื่อนำไปวางแผนทำการตลาดต่อได้อย่างแม่นยำ
              </p>
            </div>
            <span className="text-[10px] text-lime-400/80 font-semibold uppercase tracking-wider block pt-4">ดูสถิติได้เรียลไทม์ →</span>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="px-6 py-24 max-w-6xl mx-auto w-full space-y-16 relative border-t border-slate-900/30">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-150">แผนราคาที่ตรงไปตรงมา</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            เลือกแพ็กเกจที่เหมาะกับระดับการเติบโตของธุรกิจคุณ ไม่มีข้อผูกมัด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-200">แผนเริ่มต้น (Free)</h3>
                <p className="text-[11px] text-slate-400">สำหรับบุคคลทั่วไปและผู้เริ่มต้นทดลองระบบ</p>
              </div>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-slate-100">฿0</span>
                <span className="text-[11px] text-slate-500 font-semibold">/ ตลอดชีพ</span>
              </div>
              <ul className="space-y-2.5 text-[11px] text-slate-400 pt-3 border-t border-slate-900/50">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>สร้างคิวอาร์โค้ดได้สูงสุด <strong>3 ลิงก์</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>ปรับเปลี่ยนลิงก์ปลายทางได้ตลอดเวลา</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>ระบบเปิดเบราว์เซอร์หลักของ LINE ป้องกันค้างหน้าแชท</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>ไม่สามารถปรับแต่งสีหรืออัปโหลดโลโก้</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>ไม่รองรับการเด้งเข้าแอปหลักตรงๆ (Shopee, IG, TikTok)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>ไม่สามารถเข้าถึงระบบวิเคราะห์สถิติเชิงลึก</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-slate-200 font-medium rounded-xl text-center text-xs transition-colors"
            >
              เริ่มต้นใช้งานฟรี
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-200">Pro รายเดือน</h3>
                <p className="text-[11px] text-slate-400">ควบคุมเต็มระบบ ปลดล็อกขีดจำกัดสำหรับธุรกิจ</p>
              </div>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-slate-100">฿129</span>
                <span className="text-[11px] text-slate-500 font-semibold">/ เดือน</span>
              </div>
              <ul className="space-y-2.5 text-[11px] text-slate-400 pt-3 border-t border-slate-900/50">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>สร้างคิวอาร์โค้ดได้<strong>ไม่จำกัดจำนวน (Unlimited)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>ปรับเปลี่ยนลิงก์ปลายทางได้ตลอดเวลา</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>ดาวน์โหลดไฟล์ความละเอียดสูงสำหรับพิมพ์ป้าย (PNG, SVG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span><strong>ปรับแต่งดีไซน์เต็มระบบ</strong> (เลือกสี + อัปโหลดโลโก้ตรงกลาง)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span><strong>ระบบเด้งเข้าแอปหลักตรงๆ</strong> (Shopee, Lazada, TikTok, IG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span><strong>วิเคราะห์พฤติกรรมการสแกนเชิงลึก</strong> แบบเรียลไทม์</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl text-center text-xs transition-colors"
            >
              สมัครสมาชิก Pro รายเดือน
            </Link>
          </div>

          {/* Pro Yearly */}
          <div className="bg-slate-900/40 border border-lime-400/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 bg-lime-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
              แนะนำ คุ้มสุด! (เซฟ 36%)
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
                  Pro รายปี 🔥
                  <Sparkles className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">ประหยัดสูงสุด 36% คุ้มค่าระยะยาวที่สุด</p>
              </div>
              <div className="space-y-0.5 pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-100">฿990</span>
                  <span className="text-[11px] text-slate-500 font-semibold">/ ปี</span>
                </div>
                <span className="text-[9px] text-slate-500 block">เฉลี่ยเพียง ฿82.5 / เดือน</span>
              </div>
              <ul className="space-y-2.5 text-[11px] text-slate-350 pt-3 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span><strong>ฟีเจอร์ระดับ Pro ครบครันทุกอย่าง</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>สร้างคิวอาร์โค้ดได้ไม่จำกัดจำนวน</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>สแกนไว ป้องกันบล็อก LINE Sandbox 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>รับสิทธิ์การสนับสนุนลำดับสำคัญพิเศษ (Priority Support)</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-center text-xs transition-all active:scale-95 shadow-lg shadow-lime-400/5"
            >
              สมัครสมาชิก Pro รายปี คุ้มที่สุด
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} QRCup (คิวอาร์คัพ). All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-650">
            <span>สร้างสำหรับธุรกิจและครีเอเตอร์ชาวไทย</span>
            <Heart className="w-3.5 h-3.5 text-red-500/40" />
          </div>
        </div>
      </footer>
    </div>
  );
}
