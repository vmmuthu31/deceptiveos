import '@/app/globals.css';
import { Sidebar } from '@/client/components/layout/Sidebar';
import { Topbar } from '@/client/components/layout/Topbar';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CipherNest — Adversarial AI Cyber Deception Engine',
  description: 'Local-first AI Cyber Deception Engine with Living Digital Twin Decoys & Steganographic Watermarks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 antialiased min-h-screen">
        <Sidebar />
        <Topbar />
        <main className="pl-64 pt-16 min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
