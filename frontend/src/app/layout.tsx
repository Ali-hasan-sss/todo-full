import type { Metadata } from "next";
import { Tajawal, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-geist-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تاسك فلو — إدارة المهام الحديثة",
  description: "نظام إدارة مهام متكامل مع لوحة كانبان والتقويم والتحليلات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
