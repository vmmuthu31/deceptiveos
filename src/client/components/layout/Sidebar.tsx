'use client';

import { cn } from '@/client/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiDashboard3Line,
  RiFileShield2Line,
  RiFingerprintLine,
  RiSettings4Line,
  RiShieldCrossLine
} from 'react-icons/ri';

interface NavSection {
  title: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navSections: NavSection[] = [
  {
    title: 'SECURITY OPERATIONS',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: RiDashboard3Line },
      { label: 'Decoy Nodes', href: '/honeypots', icon: RiShieldCrossLine },
      { label: 'Threat Stream', href: '/events', icon: RiFingerprintLine },
    ],
  },
  {
    title: 'DECEPTION ENGINE',
    items: [
      { label: 'Attacker DNA', href: '/alerts', icon: RiAlertLine },
      { label: 'Lure Studio', href: '/lures', icon: RiFileShield2Line },
    ],
  },
  {
    title: 'GOVERNANCE & AUDIT',
    items: [
      { label: 'Compliance & Audit', href: '/settings', icon: RiSettings4Line },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-[#0F1626] border-r border-[#1E293B] flex flex-col z-50 font-sans transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          // Mobile slide-out drawer positioning
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0E17]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm border border-indigo-400/40">
              <RiShieldCrossLine className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="whitespace-nowrap transition-opacity">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-xs tracking-wider text-slate-100 uppercase">
                    CIPHER<span className="text-indigo-400">NEST</span>
                  </h1>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    v1.4
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono tracking-tight">ADVERSARIAL AI DEFENSE</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] cursor-pointer"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] cursor-pointer transition-colors"
            >
              {collapsed ? <RiArrowRightSLine className="w-4 h-4" /> : <RiArrowLeftSLine className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-2.5 space-y-5 overflow-y-auto overflow-x-hidden">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {(!collapsed || mobileOpen) ? (
                <h3 className="px-2.5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest font-mono mb-1.5 whitespace-nowrap">
                  {section.title}
                </h3>
              ) : (
                <div className="h-[1px] bg-[#1E293B] my-2 mx-1" />
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors group relative',
                      isActive
                        ? 'bg-indigo-950/50 text-indigo-300 border-l-2 border-indigo-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1B2640]/50',
                      collapsed && !mobileOpen ? 'justify-center px-2' : ''
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200')} />
                    {(!collapsed || mobileOpen) && (
                      <span className="whitespace-nowrap transition-opacity">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Status */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B0E17]">
          {(!collapsed || mobileOpen) ? (
            <div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-300 text-[11px] font-medium">Air-Gap Local</span>
                </div>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1E293B] text-slate-300">ONLINE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Ollama: llama3.1:8b</p>
            </div>
          ) : (
            <div className="flex justify-center" title="Air-Gap Local Engine: ONLINE (llama3.1:8b)">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};


