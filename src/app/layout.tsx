import '@/app/globals.css';
import { ShellLayout } from '@/client/components/layout/ShellLayout';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CipherNest — Adversarial AI Cyber Deception Engine',
  description: 'Local-first AI Cyber Deception Engine with Living Digital Twin Decoys & Steganographic Watermarks',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased min-h-screen selection:bg-indigo-600 selection:text-white">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}


