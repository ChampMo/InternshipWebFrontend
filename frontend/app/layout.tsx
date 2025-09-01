import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/src/context/toast-context'
import { PermissionsProvider } from '@/src/context/permission-context';
import Sidebar from '@/src/components/sidebar'
import { Orbitron } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyber Command",
  description: "",
  icons: {
    icon: [{ url: '/favicon-v3.ico' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
};

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"], // เลือกตามที่ใช้จริง เพื่อลดขนาด
  display: "swap",
  variable: "--font-orbitron",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="en" className={orbitron.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <PermissionsProvider>
          <div className='flex-1 flex md:flex-row flex-col'>
            <Sidebar/>
            <div className='flex-1'>
              {children}
            </div>
          </div>

          </PermissionsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
