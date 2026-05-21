import type { Metadata } from "next";
import { Kanit, Geist_Mono } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QRCup (คิวอาร์คัพ) - ระบบจัดการคิวอาร์โค้ดอัจฉริยะ สำหรับธุรกิจและครีเอเตอร์",
  description: "ปรับแต่งสไตล์ สี และโลโก้คิวอาร์โค้ดของคุณ เปลี่ยนลิงก์ปลายทางได้ตลอดเวลา ข้ามหน้าต่างบราวเซอร์ LINE โดยอัตโนมัติ และติดตามสถิติด้วยความเร็วสูงด้วย Edge Caching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${kanit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
