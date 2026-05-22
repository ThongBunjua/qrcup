import type { Metadata } from "next";
import { Prompt, Geist_Mono } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'QRCup | พิมพ์ป้ายคิวอาร์โค้ดครั้งเดียว เปลี่ยนลิงก์ปลายทางได้ตลอดชีพ',
  description: 'สร้างคิวอาร์โค้ดอัจฉริยะสำหรับร้านค้า เปลี่ยนลิงก์ปลายทางได้ตลอดเวลาโดยไม่ต้องปริ้นท์ป้ายใหม่ หมดปัญหาสแกนคิวอาร์ใน LINE แล้วค้าง ดึงลูกค้าวาร์ปเข้าแอป Shopee, TikTok Shop, และ Instagram ของคุณได้ทันที',
  keywords: [
    'คิวอาร์โค้ดเปลี่ยนลิงก์ได้',
    'สแกน QR ในไลน์แล้วค้าง',
    'Dynamic QR Code ภาษาไทย',
    'สร้างคิวอาร์โค้ดร้านค้าฟรี',
    'สแกนคิวอาร์เด้งเข้าแอป TikTok',
    'ลิงก์สแกนเข้า Shopee',
    'QRCup'
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'QRCup | พิมพ์ป้ายคิวอาร์โค้ดครั้งเดียว เปลี่ยนลิงก์ปลายทางได้ตลอดชีพ',
    description: 'สร้างคิวอาร์โค้ดอัจฉริยะสำหรับร้านค้า เปลี่ยนลิงก์ปลายทางได้ตลอดเวลาโดยไม่ต้องปริ้นท์ป้ายใหม่ หมดปัญหาสแกนคิวอาร์ใน LINE แล้วค้าง ดึงลูกค้าวาร์ปเข้าแอป Shopee, TikTok Shop, และ Instagram ของคุณได้ทันที',
    url: 'https://qrcup.vercel.app',
    siteName: 'QRCup',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'QRCup คิวอาร์โค้ดอัจฉริยะ',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  verification: {
    google: "zgOtjgGcdcozh9URwlrROHCg-Xok0VJEvsXpPfEVbTY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFAF6] text-slate-800">{children}</body>
    </html>
  );
}
