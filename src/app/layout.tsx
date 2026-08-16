import '@/app/globals.css';
import { ShellLayout } from '@/client/components/layout/ShellLayout';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CipherNest — Adversarial AI Cyber Deception Engine',
  description: 'Local-first AI Cyber Deception Engine with Living Digital Twin Decoys & Steganographic Watermarks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0E17] text-slate-100 antialiased min-h-screen">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}

