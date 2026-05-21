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
