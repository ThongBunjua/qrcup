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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 rounded-xl transition-all shadow-md shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-lime-500/10 text-lime-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-lime-500/20">
                /q/{shortCode}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight mt-1">{qrTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            ย้อนหลัง 7 วัน
          </span>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชสถิติ'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 text-lime-400 animate-spin" />
          <span className="text-sm font-medium text-slate-400">กำลังโหลดสถิติคิวอาร์โค้ด...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-red-300">ดึงข้อมูลสถิติไม่สำเร็จ</h3>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <>
          {/* Headline Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scans Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">ยอดการสแกนสะสมทั้งหมด</span>
                <span className="text-4xl font-extrabold text-slate-100 block tracking-tight">{totalScans.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-lime-500/10 text-lime-400 rounded-2xl border border-lime-500/20 group-hover:scale-105 transition-all">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            {/* Mobile Scan Ratio */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">สัดส่วนสแกนผ่านมือถือ</span>
                <span className="text-4xl font-extrabold text-slate-100 block tracking-tight">
                  {getPercent(iosCount + androidCount)}%
                </span>
              </div>
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 group-hover:scale-105 transition-all">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            {/* In-App Ratio */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-transparent pointer-events-none" />
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">สแกนจากแอปโซเชียล (WebView)</span>
                <span className="text-4xl font-extrabold text-slate-100 block tracking-tight">
                  {getPercent(
                    (browsers['LINE'] || 0) + (browsers['TikTok'] || 0) + (browsers['Instagram'] || 0) + (browsers['Facebook'] || 0)
                  )}%
                </span>
              </div>
              <div className="p-4 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20 group-hover:scale-105 transition-all">
                <Globe className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* SVG Main Chart Panel */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                สถิติความเร็วการสแกนรายวัน (สแกน/วัน)
              </h2>
              <span className="text-xs font-medium text-slate-500">
                สแกนสูงสุดต่อวัน: <strong className="text-slate-300 font-semibold">{maxScanCount} ครั้ง</strong>
              </span>
            </div>

            {totalScans === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-700" />
                <span className="text-xs italic">ยังไม่มีข้อมูลการสแกนในระบบ ลองพิมพ์คิวอาร์โค้ดและสแกนเพื่อทดสอบสถิติแรกของคุณ!</span>
              </div>
            ) : (
              <div className="w-full overflow-x-auto select-none font-sans">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full min-w-[550px] h-auto drop-shadow-lg"
                >
                  <defs>
                    {/* Glowing Lime Gradient Fill */}
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#a3e635" stopOpacity="0.00" />
                    </linearGradient>
                    {/* Line glow filter */}
                    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#a3e635" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = paddingTop + ratio * graphHeight;
                    const val = Math.round(maxScanCount * (1 - ratio));
                    return (
                      <g key={i} className="opacity-40">
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={chartWidth - paddingRight}
                          y2={y}
                          stroke="#334155"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingLeft - 8}
                          y={y + 4}
                          fill="#64748b"
                          fontSize="10"
                          textAnchor="end"
                          fontFamily="monospace"
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
                    stroke="#a3e635"
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
                        fill="#0f172a"
                        stroke="#a3e635"
                        strokeWidth="3"
                        className="transition-all duration-200 group-hover/dot:r-8"
                      />
                      {/* Tooltip value */}
                      <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <rect
                          x={p.x - 24}
                          y={p.y - 32}
                          width="48"
                          height="20"
                          rx="4"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={p.x}
                          y={p.y - 18}
                          fill="#f8fafc"
                          fontSize="10"
                          fontWeight="bold"
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
                      fontWeight="600"
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <Compass className="w-4.5 h-4.5 text-indigo-400" />
                วิเคราะห์ประเภทอุปกรณ์ของผู้สแกน (Device Platforms)
              </h3>

              {totalScans === 0 ? (
                <div className="py-12 text-center text-slate-500 italic text-sm">ยังไม่มีข้อมูลประเภทอุปกรณ์</div>
              ) : (
                <div className="space-y-4">
                  {/* iOS Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                        iOS (iPhone / iPad)
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {iosCount} สแกน <span className="text-slate-500">({getPercent(iosCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-lime-400 rounded-full" style={{ width: `${getPercent(iosCount)}%` }} />
                    </div>
                  </div>

                  {/* Android Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        Android Mobile (มือถือ / แท็บเล็ต)
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {androidCount} สแกน <span className="text-slate-500">({getPercent(androidCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${getPercent(androidCount)}%` }} />
                    </div>
                  </div>

                  {/* Desktop Platform */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                        Desktop Web (คอมพิวเตอร์ทั่วไป)
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {desktopCount} สแกน <span className="text-slate-500">({getPercent(desktopCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: `${getPercent(desktopCount)}%` }} />
                    </div>
                  </div>

                  {/* Other Device */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        อุปกรณ์อื่นๆ / ไม่ทราบประเภท
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {otherDeviceCount} สแกน <span className="text-slate-500">({getPercent(otherDeviceCount)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: `${getPercent(otherDeviceCount)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Browser Breakdown Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <Award className="w-4.5 h-4.5 text-teal-400" />
                บราวเซอร์และแหล่งที่มา (Browsers & WebViews)
              </h3>

              {totalScans === 0 ? (
                <div className="py-12 text-center text-slate-500 italic text-sm">ยังไม่มีข้อมูลแหล่งที่มาสแกน</div>
              ) : (
                <div className="space-y-4">
                  {sortedBrowsers.map(([browserName, count], idx) => {
                    const colors = [
                      'bg-lime-400',
                      'bg-indigo-400',
                      'bg-teal-400',
                      'bg-yellow-400',
                      'bg-pink-400',
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
                      <div key={browserName} className="flex items-center justify-between border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                          <span className="text-sm font-semibold text-slate-300">
                            {browserLabel}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-400">
                          {count} สแกน <span className="text-slate-500 text-xs ml-1 font-normal">({getPercent(count)}%)</span>
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
