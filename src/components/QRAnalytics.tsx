'use client';

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { BarChart3, Smartphone, Globe, ArrowLeft, RefreshCw, Calendar, TrendingUp, Compass, Award, AlertTriangle } from 'lucide-react';

interface QRAnalyticsProps {
  qrCodeId: string;
  qrTitle: string;
  shortCode: string;
  onBack: () => void;
}

interface ScanLog {
  scanned_at: string;
  device_type: string;
  browser: string;
}

export default function QRAnalytics({ qrCodeId, qrTitle, shortCode, onBack }: QRAnalyticsProps) {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = React.useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    setError('');

    try {
      const supabase = getSupabaseClient();
      const { data, error: fetchErr } = await supabase
        .from('scan_logs')
        .select('scanned_at, device_type, browser')
        .eq('qr_code_id', qrCodeId)
        .order('scanned_at', { ascending: true });

      if (fetchErr) throw fetchErr;
      setLogs(data || []);
    } catch (err: unknown) {
      console.error('Failed to load analytics logs:', err);
      const errMsg = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลสถิติการสแกนได้';
      setError(errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [qrCodeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Aggregate stats
  const totalScans = logs.length;

  // Device Breakdown calculations
  const devices = logs.reduce((acc: Record<string, number>, log) => {
    const dev = log.device_type || 'Other';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {});

  const iosCount = devices['iOS'] || 0;
  const androidCount = devices['Android'] || 0;
  const desktopCount = devices['Desktop'] || 0;
  const otherDeviceCount = (devices['Other'] || 0);

  const getPercent = (count: number) => {
    if (totalScans === 0) return 0;
    return Math.round((count / totalScans) * 100);
  };

  // Browser Breakdown calculations
  const browsers = logs.reduce((acc: Record<string, number>, log) => {
    const browser = log.browser || 'Other';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});

  const sortedBrowsers = Object.entries(browsers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 browsers

  // Timeline (Last 7 Days)
  const getTimelineData = () => {
    const dataPoints: { dateLabel: string; count: number; dayName: string }[] = [];
    const daysShort = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    
    // Generate past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayLabel = `${d.getDate()} ${d.toLocaleString('th-TH', { month: 'short' })}`;
      
      // Filter logs for this specific date
      const matchCount = logs.filter(log => {
        const logDate = new Date(log.scanned_at).toISOString().split('T')[0];
        return logDate === dateStr;
      }).length;

      dataPoints.push({
        dateLabel: dayLabel,
        count: matchCount,
        dayName: daysShort[d.getDay()],
      });
    }
    return dataPoints;
  };

  const timelineData = getTimelineData();
  const maxScanCount = Math.max(...timelineData.map(d => d.count), 5); // minimum ceiling for nice ratio

  // Build the SVG chart coordinates (viewbox width 600, height 240)
  const chartWidth = 600;
  const chartHeight = 240;
  const paddingLeft = 48;
  const paddingRight = 24;
  const paddingTop = 32;
  const paddingBottom = 40;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const points = timelineData.map((data, index) => {
    const x = paddingLeft + (index / (timelineData.length - 1)) * graphWidth;
    const y = chartHeight - paddingBottom - (data.count / maxScanCount) * graphHeight;
    return { x, y, label: data.dateLabel, count: data.count };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-[#FCFAF6] border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350 rounded-2xl transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100/50">
                /q/{shortCode}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight mt-1">{qrTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            ย้อนหลัง 7 วัน
          </span>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100/50 text-emerald-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชสถิติ'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">กำลังโหลดสถิติคิวอาร์โค้ด...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">ดึงข้อมูลสถิติไม่สำเร็จ</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Headline Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scans Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/2 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ยอดการสแกนสะสมทั้งหมด</span>
                <span className="text-4xl font-extrabold text-slate-800 block tracking-tight">{totalScans.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/50 group-hover:scale-105 transition-all">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            {/* Mobile Scan Ratio */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/2 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">สัดส่วนสแกนผ่านมือถือ</span>
                <span className="text-4xl font-extrabold text-slate-800 block tracking-tight">
                  {getPercent(iosCount + androidCount)}%
                </span>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50 group-hover:scale-105 transition-all">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            {/* In-App Ratio */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/2 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">สแกนจากแอปโซเชียล (WebView)</span>
                <span className="text-4xl font-extrabold text-slate-800 block tracking-tight">
                  {getPercent(
                    (browsers['LINE'] || 0) + (browsers['TikTok'] || 0) + (browsers['Instagram'] || 0) + (browsers['Facebook'] || 0)
                  )}%
                </span>
              </div>
              <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100/50 group-hover:scale-105 transition-all">
                <Globe className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* SVG Main Chart Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                สถิติความเร็วการสแกนรายวัน (สแกน/วัน)
              </h2>
              <span className="text-xs font-bold text-slate-400">
                สแกนสูงสุดต่อวัน: <strong className="text-emerald-600 font-extrabold">{maxScanCount} ครั้ง</strong>
              </span>
            </div>

            {totalScans === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-200 animate-pulse" />
                <span className="text-xs italic text-slate-400 leading-relaxed text-center max-w-xs">ยังไม่มีข้อมูลการสแกนในระบบ ลองพิมพ์คิวอาร์โค้ดและสแกนเพื่อทดสอบสถิติแรกของคุณ!</span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto select-none font-sans">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full min-w-[550px] h-auto drop-shadow-sm"
                >
                  <defs>
                    {/* Glowing Emerald Gradient Fill */}
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                    </linearGradient>
                    {/* Line glow filter */}
                    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.2" />
                    </filter>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = paddingTop + ratio * graphHeight;
                    const val = Math.round(maxScanCount * (1 - ratio));
                    return (
                      <g key={i} className="opacity-100">
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={chartWidth - paddingRight}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingLeft - 10}
                          y={y + 3.5}
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="end"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Glowing Area Fill */}
                  <path d={areaPath} fill="url(#chartGrad)" />

                  {/* Chart Line Path */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {/* Circles and interactive points */}
                  {points.map((p, i) => (
                    <g key={i} className="group/dot cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="6"
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        className="transition-all duration-200 group-hover/dot:r-8"
                      />
                      {/* Tooltip value */}
                      <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <rect
                          x={p.x - 24}
                          y={p.y - 32}
                          width="48"
                          height="20"
                          rx="6"
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth="1.2"
                        />
                        <text
                          x={p.x}
                          y={p.y - 18}
                          fill="#334155"
                          fontSize="10"
                          fontWeight="extrabold"
                          textAnchor="middle"
                        >
                          {p.count}
                        </text>
                      </g>
                    </g>
                  ))}

                  {/* X Axis Labels */}
                  {points.map((p, i) => (
                    <text
                      key={i}
                      x={p.x}
                      y={chartHeight - 12}
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {timelineData[i].dateLabel}
                    </text>
                  ))}
                </svg>
              </div>
            )}
          </div>

          {/* Device & Browser Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
            {/* Device breakdown card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <Compass className="w-4.5 h-4.5 text-indigo-500" />
                วิเคราะห์ประเภทอุปกรณ์ของผู้สแกน (Device Platforms)
              </h3>

              {totalScans === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-sm">ยังไม่มีข้อมูลประเภทอุปกรณ์</div>
              ) : (
                <div className="space-y-4">
                  {/* iOS Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        iOS (iPhone / iPad)
                      </span>
                      <span className="text-slate-600 font-bold">
                        {iosCount} สแกน <span className="text-slate-400">({getPercent(iosCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FCFAF6] border border-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${getPercent(iosCount)}%` }} />
                    </div>
                  </div>

                  {/* Android Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        Android Mobile (มือถือ / แท็บเล็ต)
                      </span>
                      <span className="text-slate-600 font-bold">
                        {androidCount} สแกน <span className="text-slate-400">({getPercent(androidCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FCFAF6] border border-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${getPercent(androidCount)}%` }} />
                    </div>
                  </div>

                  {/* Desktop Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        Desktop Web (คอมพิวเตอร์ทั่วไป)
                      </span>
                      <span className="text-slate-600 font-bold">
                        {desktopCount} สแกน <span className="text-slate-400">({getPercent(desktopCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FCFAF6] border border-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${getPercent(desktopCount)}%` }} />
                    </div>
                  </div>

                  {/* Other Device */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        อุปกรณ์อื่นๆ / ไม่ทราบประเภท
                      </span>
                      <span className="text-slate-600 font-bold">
                        {otherDeviceCount} สแกน <span className="text-slate-400">({getPercent(otherDeviceCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#FCFAF6] border border-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${getPercent(otherDeviceCount)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Browser Breakdown Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-teal-500" />
                บราวเซอร์และแหล่งที่มา (Browsers & WebViews)
              </h3>

              {totalScans === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-sm">ยังไม่มีข้อมูลแหล่งที่มาสแกน</div>
              ) : (
                <div className="space-y-4">
                  {sortedBrowsers.map(([browserName, count], idx) => {
                    const colors = [
                      'bg-emerald-500',
                      'bg-indigo-500',
                      'bg-teal-500',
                      'bg-amber-500',
                      'bg-pink-500',
                    ];
                    const color = colors[idx] || 'bg-slate-400';

                    let browserLabel = browserName;
                    if (browserName === 'LINE') browserLabel = 'LINE WebView (ในแอปไลน์)';
                    else if (browserName === 'TikTok') browserLabel = 'TikTok WebView';
                    else if (browserName === 'Instagram') browserLabel = 'Instagram WebView';
                    else if (browserName === 'Facebook') browserLabel = 'Facebook WebView';
                    else if (browserName === 'Chrome') browserLabel = 'Google Chrome';
                    else if (browserName === 'Safari') browserLabel = 'Apple Safari';

                    return (
                      <div key={browserName} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                          <span className="text-sm font-semibold text-slate-700">
                            {browserLabel}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-600">
                          {count} สแกน <span className="text-slate-400 text-xs ml-1 font-normal">({getPercent(count)}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
