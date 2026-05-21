import React from 'react';

export const dynamic = 'force-dynamic';
import { getSupabaseServer } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Enforce server-side authenticated guard
  if (error || !user) {
    redirect('/login');
  }

  // Fetch the user profile plan status
  const { data: profile } = await supabase
    .from('users')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const plan = (user.email === 'admin@qrcup.com' ? 'pro' : (profile?.plan || 'free')) as 'free' | 'pro';

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-slate-800 flex flex-col md:flex-row select-none relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-white shrink-0 flex flex-col justify-between p-6 z-10">
        <div className="space-y-8">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 p-2 flex items-center justify-center shadow-sm shadow-emerald-500/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-800 group-hover:text-emerald-600 transition-colors leading-none">
                QRCup
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-none mt-1">
                คิวอาร์คัพ
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 bg-emerald-50/50 border border-emerald-100/30 text-emerald-700 font-bold rounded-2xl text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-500" />
              แผงควบคุมคิวอาร์โค้ด
            </Link>
          </nav>
        </div>

        {/* Footer / Account Segment */}
        <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
          {/* Subscription Tier display */}
          <div className="bg-[#FCFAF6] border border-slate-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">แผนการใช้งาน</span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  plan === 'pro'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border-slate-200/50'
                }`}
              >
                {plan === 'pro' ? 'รุ่นโปร (PRO)' : 'รุ่นฟรี (FREE)'}
              </span>
            </div>
            {plan === 'free' ? (
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                จำกัดสูงสุด 3 คิวอาร์โค้ดปกติ อัปเกรดเพื่อสร้างไม่จำกัดและปลดล็อกการปรับแต่งสไตล์
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                เปิดสิทธิ์คิวอาร์ไม่จำกัด ดาวน์โหลดไฟล์เวกเตอร์ และระบบนำทางแอปพลิเคชันไทยตรง!
              </p>
            )}
          </div>

          {/* User profile identifier */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-medium">
            <span className="truncate max-w-[120px]" title={user.email}>{user.email}</span>
            {/* Logout button */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

