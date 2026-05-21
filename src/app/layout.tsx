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
  title: "QRCup (คิวอาร์คัพ) - ระบบจัดการคิวอาร์โค้ดอัจฉริยะ สำหรับธุรกิจและครีเอเตอร์",
  description: "ปรับแต่งสไตล์ สี และโลโก้คิวอาร์โค้ดของคุณ เปลี่ยนลิงก์ปลายทางได้ตลอดเวลา ข้ามหน้าต่างบราวเซอร์ LINE โดยอัตโนมัติ และติดตามสถิติด้วยความเร็วสูงด้วย Edge Caching",
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
