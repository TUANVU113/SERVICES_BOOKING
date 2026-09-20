import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gentleman Barber - Tiệm Cắt Tóc Quý Ông & Service Booking",
  description: "Dịch vụ cắt tạo kiểu tóc nam, cạo râu và chăm sóc da mặt chuyên nghiệp. Đặt lịch cắt tóc online nhanh chóng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
