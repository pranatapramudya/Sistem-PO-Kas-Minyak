import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/modern-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sistem PO & Kas Minyak | Manajemen PO & Kas",
  description: "Aplikasi Manajemen PO & Kas Trading Minyak",
  applicationName: "Sistem PO & Kas Minyak",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sistem PO & Kas Minyak",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-blue-100 selection:text-blue-900`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}