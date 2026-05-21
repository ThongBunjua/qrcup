'use client';

import React, { useState, useEffect } from 'react';
import QRCustomizer from '@/components/QRCustomizer';
import QRAnalytics from '@/components/QRAnalytics';
import { 
  Sparkles, Plus, Search, QrCode, BarChart3, Edit3, Trash2, 
  ArrowUpRight, Lock, ShieldAlert, CreditCard, RefreshCw 
} from 'lucide-react';

interface QRCodeData {
  id: string;
  title: string;
  target_url: string;
  short_code: string;
  config: {
    fgColor?: string;
    bgColor?: string;
    logoUrl?: string;
  };
  is_active: boolean;
  scan_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation states
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'analytics'>('list');
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  
  // Billing loading indicators
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Upgrade Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('yearly');

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/qr');
      const data = await res.json();
      if (res.ok) {
        setQrCodes(data.qr_codes || []);
        setPlan(data.plan || 'free');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Downgrade protection checks
  const totalCodesCount = qrCodes.length;
  const isDowngradeLocked = plan === 'free' && totalCodesCount > 3;

  // Toggle QR Activation
  const handleToggleActive = async (qr: QRCodeData) => {
    if (isDowngradeLocked) return;

    try {
      const res = await fetch('/api/qr', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...qr,
          is_active: !qr.is_active
        })
      });
      if (res.ok) {
        setQrCodes(prev => prev.map(item => item.id === qr.id ? { ...item, is_active: !item.is_active } : item));
      }
    } catch (err) {
      console.error('Toggle QR active failed:', err);
    }
  };

  // Delete QR Code
  const handleDeleteQR = async (id: string) => {
    if (!window.confirm('คุณแน่ใจอย่างยิ่งหรือไม่ว่าต้องการลบคิวอาร์โค้ดนี้? เมื่อลบแล้วการสแกนผ่านคิวอาร์เดิมจะใช้งานไม่ได้ในทันที')) {
      return;
    }

    try {
      const res = await fetch(`/api/qr?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQrCodes(prev => prev.filter(item => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'การลบคิวอาร์โค้ดล้มเหลว');
      }
    } catch (err) {
      console.error('Delete QR failed:', err);
    }
  };

  const handleSaveQR = async (payload: {
    id?: string;
    title: string;
    target_url: string;
    config: { fgColor: string; bgColor: string; logoUrl: string };
    is_active: boolean;
  }) => {
    setSavingLoading(true);
    try {
      const isEdit = !!payload.id;
      const url = '/api/qr';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        await fetchData(); // Reload list
        setActiveView('list');
        setSelectedQR(null);
      } else {
        alert(data.error || 'การบันทึกคิวอาร์โค้ดล้มเหลว');
      }
    } catch (err) {
      console.error('Save QR failed:', err);
    } finally {
      setSavingLoading(false);
    }
  };

  // Launch Stripe Checkout for Pro upgrade
  const handleUpgrade = async (interval: 'monthly' | 'yearly') => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'ไม่สามารถเปิดหน้าชำระเงินของ Stripe ได้');
      }
    } catch (err) {
      console.error('Stripe checkout failed:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Launch Stripe Customer Portal
  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'ไม่สามารถเข้าสู่แผงจัดการชำระเงิน Stripe ได้');
      }
    } catch (err) {
      console.error('Stripe portal failed:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  // Analytics stats
  const totalScansCumulative = qrCodes.reduce((acc, code) => acc + (code.scan_count || 0), 0);
  const activeCodesCount = qrCodes.filter(c => c.is_active).length;

  // Search Filter
  const filteredQRs = qrCodes.filter(qr => 
    qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.target_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. LOCK BANNER: Graceful Downgrade Protection */}
      {isDowngradeLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-800">ระงับแผงควบคุมชั่วคราว (Graceful Downgrade)</h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                ปัจจุบันคุณใช้แผน <strong>เริ่มต้น (ฟรี)</strong> แต่มีคิวอาร์โค้ดในบัญชีทั้งหมด <strong>{totalCodesCount} อัน</strong> ซึ่งเกินกว่าขีดจำกัดแผนฟรีที่กำหนดให้มีสูงสุด 3 อัน 
                คิวอาร์โค้ดเดิมของคุณทั้งหมด**ยังคงสแกนและส่งลิงก์ปกติ 100%** แต่ระบบจะล็อกการสร้างใหม่หรือการแก้ไขชั่วคราว กรุณาลบให้เหลือ 3 อัน หรือสมัครแผนโปรเพื่อใช้งานปกติ
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            disabled={checkoutLoading}
            className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-sm shadow-amber-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {checkoutLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
            อัปเกรดเป็นแผน Pro (เริ่มต้น ฿129/เดือน)
          </button>
        </div>
      )}

      {/* 2. LOADING SCREEN */}
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <span className="text-sm text-slate-500 font-medium">กำลังโหลดระบบจัดการหลังบ้านของคุณ...</span>
        </div>
      ) : (
        <>
          {/* VIEW: MAIN LIST OF QR CODES */}
          {activeView === 'list' && (
            <div className="space-y-6">
              {/* Upper Stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats 1 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ยอดการสแกนสะสม</span>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">{totalScansCumulative.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl border border-emerald-100/50 group-hover:scale-105 transition-all">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>

                {/* Stats 2 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">คิวอาร์โค้ดที่ครอบครอง</span>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
                      {totalCodesCount} <span className="text-xs text-slate-400 font-normal">/ {plan === 'pro' ? 'ไม่จำกัด' : '3'}</span>
                    </span>
                  </div>
                  <div className="p-3.5 bg-teal-50 text-teal-500 rounded-2xl border border-teal-100/50 group-hover:scale-105 transition-all">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                {/* Stats 3 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ลิงก์ที่พร้อมใช้งาน</span>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">{activeCodesCount}</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl border border-emerald-100/50 group-hover:scale-105 transition-all">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ, รหัสย่อ หรือลิงก์ปลายทาง..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-xs font-normal shadow-sm"
                  />
                </div>

                {/* Main Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {plan === 'free' && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      อัปเกรดเป็น Pro
                    </button>
                  )}

                  {plan === 'pro' && (
                    <button
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                      className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {portalLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" /> : <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
                      จัดการบิลชำระเงิน
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedQR(null);
                      setActiveView('create');
                    }}
                    disabled={isDowngradeLocked}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-sm shadow-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    สร้างคิวอาร์โค้ดใหม่
                  </button>
                </div>
              </div>

              {/* Grid of QR Cards */}
              {filteredQRs.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                  <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">ไม่พบคิวอาร์โค้ดอัจฉริยะ</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {searchQuery ? 'ลองเปลี่ยนคีย์เวิร์ดการค้นหาของคุณ' : 'เริ่มต้นสร้างคิวอาร์โค้ดอัจฉริยะแบบไดนามิกตัวแรกเพื่อใช้เก็บยอดการสแกนและนำทางลูกค้า'}
                    </p>
                  </div>
                  {!searchQuery && !isDowngradeLocked && (
                    <button
                      onClick={() => setActiveView('create')}
                      className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      เริ่มสร้างคิวอาร์โค้ด
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQRs.map(qr => (
                    <div 
                      key={qr.id}
                      className="bg-white border border-slate-100 rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-slate-200 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Title & Active badge */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-slate-850 truncate text-sm" title={qr.title}>{qr.title}</h3>
                          <button
                            onClick={() => handleToggleActive(qr)}
                            disabled={isDowngradeLocked}
                            className={`shrink-0 transition-opacity cursor-pointer ${isDowngradeLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                          >
                            {qr.is_active ? (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                                ใช้งานอยู่
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-450 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                                ระงับชั่วคราว
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Shortcode URL Link */}
                        <div className="bg-[#FCFAF6] border border-slate-100/50 p-3.5 rounded-2xl space-y-1 font-mono">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ลิงก์คิวอาร์โค้ดแบบสั้น</span>
                          <a 
                            href={`${window.location.origin}/q/${qr.short_code}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 break-all"
                          >
                            {window.location.host}/q/{qr.short_code}
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>

                        {/* Target URL */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ลิงก์ปลายทาง (Target URL)</span>
                          <span className="text-xs text-slate-500 font-medium truncate block max-w-full" title={qr.target_url}>
                            {qr.target_url}
                          </span>
                        </div>
                      </div>

                      {/* Cumulative metric & actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">ยอดสแกนรวม</span>
                          <span className="text-sm font-black text-slate-700">{qr.scan_count.toLocaleString()} ครั้ง</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedQR(qr);
                              setActiveView('analytics');
                            }}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="ดูรายงานวิเคราะห์สถิติ"
                          >
                            <BarChart3 className="w-4.5 h-4.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedQR(qr);
                              setActiveView('edit');
                            }}
                            disabled={isDowngradeLocked}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              isDowngradeLocked 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                            title={isDowngradeLocked ? 'การแก้ไขระบบถูกล็อกเนื่องจากเกินลิมิตแผนฟรี' : 'แก้ไข / ปรับแต่งสีและโลโก้'}
                          >
                            {isDowngradeLocked ? <Lock className="w-4 h-4" /> : <Edit3 className="w-4.5 h-4.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteQR(qr.id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                            title="ลบคิวอาร์โค้ดนี้"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CREATE NEW QR CODE */}
          {activeView === 'create' && (
            <QRCustomizer
              onSave={handleSaveQR}
              onCancel={() => setActiveView('list')}
              isSaving={savingLoading}
            />
          )}

          {/* VIEW: EDIT STYLE / CONFIG */}
          {activeView === 'edit' && selectedQR && (
            <QRCustomizer
              initialData={selectedQR}
              onSave={handleSaveQR}
              onCancel={() => {
                setActiveView('list');
                setSelectedQR(null);
              }}
              isSaving={savingLoading}
            />
          )}

          {/* VIEW: ANALYTICS OVERVIEW */}
          {activeView === 'analytics' && selectedQR && (
            <QRAnalytics
              qrCodeId={selectedQR.id}
              qrTitle={selectedQR.title}
              shortCode={selectedQR.short_code}
              onBack={() => {
                setActiveView('list');
                setSelectedQR(null);
              }}
            />
          )}
        </>
      )}

      {/* 3. UPGRADE OPTIONS MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-xl relative">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">อัปเกรดบัญชี QRCup Pro ⚡</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                ปลดล็อกการสร้างคิวอาร์โค้ดไม่จำกัด ดาวน์โหลดไฟล์ความละเอียดสูง (PNG, SVG) ปรับแต่งโลโก้ และระบบสถิติหลังบ้านเชิงลึกสำหรับธุรกิจของคุณ
              </p>
            </div>

            {/* Select Tiers */}
            <div className="space-y-3">
              {/* Annual Tier */}
              <label 
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedInterval === 'yearly'
                    ? 'bg-emerald-50/50 border-emerald-500 text-slate-850'
                    : 'bg-[#FCFAF6] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                onClick={() => setSelectedInterval('yearly')}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="interval" 
                    checked={selectedInterval === 'yearly'}
                    onChange={() => setSelectedInterval('yearly')}
                    className="accent-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-slate-800">แผนรายปี (แนะนำ คุ้มค่าที่สุด)</span>
                    <span className="text-[10px] text-slate-500 block">ประหยัดสูงสุด 36%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold block text-slate-800">฿990 / ปี</span>
                  <span className="text-[9px] text-slate-450 block">เฉลี่ยเพียง ฿82.5 / เดือน</span>
                </div>
              </label>

              {/* Monthly Tier */}
              <label 
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedInterval === 'monthly'
                    ? 'bg-emerald-50/50 border-emerald-500 text-slate-850'
                    : 'bg-[#FCFAF6] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                onClick={() => setSelectedInterval('monthly')}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="interval" 
                    checked={selectedInterval === 'monthly'}
                    onChange={() => setSelectedInterval('monthly')}
                    className="accent-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-slate-800">แผนรายเดือน</span>
                    <span className="text-[10px] text-slate-500 block">จ่ายสบายแบบรายเดือน</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold block text-slate-800">฿129 / เดือน</span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={checkoutLoading}
                className="w-1/2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-550 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleUpgrade(selectedInterval)}
                disabled={checkoutLoading}
                className="w-1/2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                {checkoutLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'ดำเนินการต่อ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
