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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950 shrink-0 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-lime-400/10">
              <Sparkles className="w-4.5 h-4.5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-100 group-hover:text-lime-400 transition-colors leading-none">
                QRCup
              </span>
              <span className="text-[10px] font-medium text-slate-550 leading-none mt-0.5">
                คิวอาร์คัพ
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 border border-slate-800 text-slate-200 font-semibold rounded-xl text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-lime-400" />
              แผงควบคุมคิวอาร์โค้ด
            </Link>
          </nav>
        </div>

        {/* Footer / Account Segment */}
        <div className="space-y-4 pt-6 border-t border-slate-900 mt-6">
          {/* Subscription Tier display */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">แผนการใช้งาน</span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  plan === 'pro'
                    ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                }`}
              >
                {plan === 'pro' ? 'รุ่นโปร (PRO)' : 'รุ่นฟรี (FREE)'}
              </span>
            </div>
            {plan === 'free' ? (
              <p className="text-[11px] text-slate-500 leading-normal">
                จำกัดสูงสุด 3 คิวอาร์โค้ดปกติ อัปเกรดเพื่อสร้างไม่จำกัดและปลดล็อกการปรับแต่งสไตล์
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-normal">
                เปิดสิทธิ์คิวอาร์ไม่จำกัด ดาวน์โหลดไฟล์เวกเตอร์ และระบบนำทางแอปพลิเคชันไทยตรง!
              </p>
            )}
          </div>

          {/* User profile identifier */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="truncate max-w-[120px] font-medium" title={user.email}>{user.email}</span>
            {/* Logout button */}
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 hover:bg-slate-900 hover:text-red-400 rounded-lg transition-all"
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

