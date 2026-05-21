'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Upload, Download, Palette, Link, FileText, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface QRCustomizerProps {
  initialData?: {
    id?: string;
    title: string;
    target_url: string;
    config: {
      fgColor?: string;
      bgColor?: string;
      logoUrl?: string;
    };
    is_active?: boolean;
    short_code?: string;
  };
  onSave: (data: {
    id?: string;
    title: string;
    target_url: string;
    config: { fgColor: string; bgColor: string; logoUrl: string };
    is_active: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function QRCustomizer({ initialData, onSave, onCancel, isSaving }: QRCustomizerProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [targetUrl, setTargetUrl] = useState(initialData?.target_url || '');
  const [fgColor, setFgColor] = useState(initialData?.config?.fgColor || '#020617'); // Dark slate primary
  const [bgColor, setBgColor] = useState(initialData?.config?.bgColor || '#ffffff');
  const [logoUrl, setLogoUrl] = useState(initialData?.config?.logoUrl || '');
  const [isActive, setIsActive] = useState(initialData?.is_active !== undefined ? initialData.is_active : true);
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [validationError, setValidationError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-regenerate QR canvas on dependency updates
  useEffect(() => {
    const renderQR = async () => {
      if (!canvasRef.current) return;
      
      const qrText = initialData?.short_code 
        ? `${window.location.origin}/q/${initialData.short_code}`
        : 'https://qrcup.com/demo'; // Placeholder text for new codes

      try {
        // Draw the base QR Code at high-tolerance correction
        await QRCode.toCanvas(canvasRef.current, qrText, {
          errorCorrectionLevel: 'H',
          width: 320,
          margin: 1,
          color: {
            dark: fgColor,
            light: bgColor,
          },
        });

        // Overlay the logo if present
        if (logoUrl && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const img = new Image();
          img.crossOrigin = 'anonymous'; // Prevent security sandboxing on downloads
          img.src = logoUrl;
          img.onload = () => {
            const size = canvas.width;
            const logoSize = size * 0.22; // 22% of total width
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;

            // Draw a rounded card background behind logo to maintain contrast
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            const radius = 6;
            ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, radius);
            ctx.fill();

            // Draw the actual logo
            ctx.drawImage(img, x, y, logoSize, logoSize);
          };
        }
      } catch (err) {
        console.error('Failed to generate QR canvas:', err);
      }
    };

    renderQR();
  }, [fgColor, bgColor, logoUrl, initialData]);

  // Handle Logo Upload to Server-side API Route (RLS Bypass)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 1MB limit for storage conservation
    if (file.size > 1024 * 1024) {
      setUploadError('ขนาดไฟล์โลโก้ต้องไม่เกิน 1MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
      }

      setLogoUrl(data.publicUrl);
    } catch (err: unknown) {
      console.error('Logo upload error:', err);
      const errMsg = err instanceof Error ? err.message : 'อัปโหลดรูปภาพไม่สำเร็จ';
      setUploadError(errMsg);
    } finally {
      setUploading(false);
    }
  };

  // Trigger Save Action
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('กรุณากรอกชื่อคิวอาร์โค้ด');
      return;
    }

    if (!targetUrl.trim() || !targetUrl.startsWith('http')) {
      setValidationError('กรุณากรอกลิงก์ปลายทางที่ถูกต้อง (เริ่มต้นด้วย http:// หรือ https://)');
      return;
    }

    onSave({
      id: initialData?.id,
      title,
      target_url: targetUrl,
      config: { fgColor, bgColor, logoUrl },
      is_active: isActive
    });
  };

  // High-Res PNG Downloader
  const downloadPNG = () => {
    if (!canvasRef.current) return;
    
    // Create a high-res virtual canvas for printing (1000px)
    const virtualCanvas = document.createElement('canvas');
    virtualCanvas.width = 1000;
    virtualCanvas.height = 1000;
    const vCtx = virtualCanvas.getContext('2d');
    if (!vCtx) return;

    const qrText = initialData?.short_code 
      ? `${window.location.origin}/q/${initialData.short_code}`
      : 'https://qrcup.com/demo';

    QRCode.toCanvas(virtualCanvas, qrText, {
      errorCorrectionLevel: 'H',
      width: 1000,
      margin: 1,
      color: {
        dark: fgColor,
        light: bgColor,
      }
    }).then(() => {
      if (logoUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;
        img.onload = () => {
          const logoSize = 220; // 22% of 1000
          const x = (1000 - logoSize) / 2;
          const y = (1000 - logoSize) / 2;

          vCtx.fillStyle = bgColor;
          vCtx.beginPath();
          vCtx.roundRect(x - 12, y - 12, logoSize + 24, logoSize + 24, 18);
          vCtx.fill();

          vCtx.drawImage(img, x, y, logoSize, logoSize);

          // Trigger download
          triggerDownload(virtualCanvas.toDataURL('image/png'), `${title.replace(/\s+/g, '_')}_qr.png`);
        };
      } else {
        triggerDownload(virtualCanvas.toDataURL('image/png'), `${title.replace(/\s+/g, '_')}_qr.png`);
      }
    });
  };

  // Lossless Vector SVG Downloader
  const downloadSVG = async () => {
    const qrText = initialData?.short_code 
      ? `${window.location.origin}/q/${initialData.short_code}`
      : 'https://qrcup.com/demo';

    try {
      const rawSvg = await QRCode.toString(qrText, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        width: 500,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        }
      });

      let finalSvg = rawSvg;

      // Inject vector logo image if present
      if (logoUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const svgEl = doc.documentElement;

        const logoSize = 110; // 22% of 500
        const xy = (500 - logoSize) / 2;

        // Create white backing rect for contrast
        const rectEl = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectEl.setAttribute('x', (xy - 6).toString());
        rectEl.setAttribute('y', (xy - 6).toString());
        rectEl.setAttribute('width', (logoSize + 12).toString());
        rectEl.setAttribute('height', (logoSize + 12).toString());
        rectEl.setAttribute('rx', '8');
        rectEl.setAttribute('fill', bgColor);
        svgEl.appendChild(rectEl);

        // Embed the logo image
        const imgEl = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
        imgEl.setAttribute('href', logoUrl);
        imgEl.setAttribute('x', xy.toString());
        imgEl.setAttribute('y', xy.toString());
        imgEl.setAttribute('width', logoSize.toString());
        imgEl.setAttribute('height', logoSize.toString());
        svgEl.appendChild(imgEl);

        finalSvg = new XMLSerializer().serializeToString(doc);
      }

      const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
      triggerDownload(URL.createObjectURL(blob), `${title.replace(/\s+/g, '_')}_qr.svg`);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Editor Controls Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-3">
          <Palette className="w-5 h-5 text-lime-400" />
          {initialData?.id ? 'แก้ไขคิวอาร์โค้ดอัจฉริยะ' : 'ออกแบบคิวอาร์โค้ดใหม่'}
        </h2>

        {validationError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              ชื่อคิวอาร์โค้ด
            </label>
            <input
              type="text"
              placeholder="เช่น เมนูโต๊ะ 4, ลิงก์ IG ร้าน, ไลน์ร้าน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-400 transition-all"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Link className="w-4 h-4 text-slate-400" />
              ลิงก์ปลายทาง (Target URL)
            </label>
            <input
              type="url"
              placeholder="https://example.com/menu"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-400 transition-all"
            />
            <p className="text-xs text-slate-500">
              คุณสามารถแก้ไขลิงก์ปลายทางนี้เมื่อไหร่ก็ได้ในภายหลัง โดยรูปคิวอาร์โค้ดที่ดาวน์โหลดหรือพิมพ์ออกไปแล้วจะยังใช้ได้เหมือนเดิม!
            </p>
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Foreground */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">สีหลักของคิวอาร์ (Foreground)</span>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-12 bg-transparent border-0 rounded cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={fgColor.toUpperCase()}
                  onChange={(e) => setFgColor(e.target.value)}
                  maxLength={7}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-slate-600"
                />
              </div>
            </div>

            {/* Background */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">สีพื้นหลังคิวอาร์ (Background)</span>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 bg-transparent border-0 rounded cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={bgColor.toUpperCase()}
                  onChange={(e) => setBgColor(e.target.value)}
                  maxLength={7}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Logo Uploader */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">วางโลโก้ตรงกลางคิวอาร์โค้ด</span>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 p-2 flex items-center justify-center group shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-xl border border-dashed border-slate-700 hover:border-lime-500/60 bg-slate-900 hover:bg-slate-900/80 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0">
                  <Upload className="w-5 h-5 text-slate-500" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}

              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-300">
                  {uploading ? 'กำลังอัปโหลดโลโก้...' : logoUrl ? 'อัปโหลดโลโก้สำเร็จ' : 'อัปโหลดโลโก้ร้านค้า'}
                </span>
                <p className="text-xs text-slate-500">
                  รองรับ PNG/JPG แนะนำรูปจัตุรัสที่มีคอนทราสต์สูง ขนาดไม่เกิน 1MB
                </p>
                {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* Active Flag */}
          <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-slate-200">เปิดใช้งานให้สแกน (Active Scan Redirection)</span>
              <p className="text-xs text-slate-500">หากปิดการใช้งาน ผู้ที่สแกนจะพบหน้าจอแจ้งเตือนปิดปรับปรุงชั่วคราวแทนการไปยังเป้าหมาย</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                isActive ? 'bg-lime-400' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-all ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-medium rounded-xl text-sm transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSaving || uploading}
            className="px-6 py-2.5 bg-gradient-to-r from-lime-400 to-teal-500 hover:from-lime-300 hover:to-teal-400 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-lime-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {initialData?.id ? 'บันทึกการแก้ไข' : 'สร้างคิวอาร์โค้ด'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Real-time Preview Panel */}
      <div className="lg:col-span-5 flex flex-col items-center gap-6 bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 lg:p-8 shadow-2xl">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ตัวอย่างแบบเรียลไทม์</span>

        {/* QR Frame Container */}
        <div className="bg-slate-950/80 p-8 rounded-3xl border border-slate-800 shadow-inner flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-transparent pointer-events-none" />
          <canvas
            ref={canvasRef}
            className="w-64 h-64 md:w-72 md:h-72 object-contain rounded-xl border border-slate-800 shadow-2xl bg-white"
          />
        </div>

        {/* Dynamic Warning for Customizer context */}
        {!initialData?.id && (
          <p className="text-xs text-center text-slate-500 max-w-xs">
            นี่คือตัวอย่างดีไซน์คิวอาร์โค้ดของคุณ เมื่อบันทึกเรียบร้อยการสแกนจริงจะวาร์ปไปยังลิงก์ปลายทางทันที
          </p>
        )}

        {/* Download actions (Only if QR exists) */}
        {initialData?.id ? (
          <div className="w-full space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center block">ดาวน์โหลดคิวอาร์โค้ด</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={downloadPNG}
                className="py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 hover:border-slate-600 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลด PNG (ความละเอียดสูง)
              </button>
              <button
                type="button"
                onClick={downloadSVG}
                className="py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 hover:border-slate-600 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลด SVG (สำหรับโรงพิมพ์)
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center italic">
            บันทึกคิวอาร์โค้ดก่อนเพื่อดาวน์โหลดไฟล์งานพิมพ์ความละเอียดสูง
          </div>
        )}
      </div>
    </div>
  );
}
