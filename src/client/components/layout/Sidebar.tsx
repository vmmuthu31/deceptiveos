'use client';

import { cn } from '@/client/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  RiAlertLine,
  RiDashboard3Line,
  RiFileShield2Line,
  RiFingerprintLine,
  RiSettings4Line,
  RiShieldCrossLine
} from 'react-icons/ri';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: RiDashboard3Line },
  { label: 'Honeypots', href: '/honeypots', icon: RiShieldCrossLine },
  { label: 'Session Events', href: '/events', icon: RiFingerprintLine },
  { label: 'Attacker DNA', href: '/alerts', icon: RiAlertLine },
  { label: 'Lure Studio', href: '/lures', icon: RiFileShield2Line },
  { label: 'Settings & Audit', href: '/settings', icon: RiSettings4Line },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-800/80 flex flex-col z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 glow-emerald">
          <RiShieldCrossLine className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            CIPHERNEST
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">AI-DECEPTION ENGINE</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 shadow-md glow-emerald'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', isActive ? 'text-emerald-400' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse glow-emerald" />
          <span className="text-xs text-slate-300 font-medium">Air-Gap Local Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 font-mono mt-1">Ollama: llama3.1:8b (Online)</p>
      </div>
    </aside>
  );
};
