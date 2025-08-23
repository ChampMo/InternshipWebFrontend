import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/src/context/toast-context'
import { PermissionsProvider } from '@/src/context/permission-context';
import Sidebar from '@/src/components/sidebar'

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <PermissionsProvider>
          <div className='flex w-full h-screen md:flex-row flex-col'>
            <Sidebar/>
            <div className='flex-1 overflow-auto'>
              {children}
            </div>
          </div>

          </PermissionsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
