'use client';

import { cn } from '@/client/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import {
  RiAlertLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiDashboard3Line,
  RiFileShield2Line,
  RiFingerprintLine,
  RiLogoutBoxRLine,
  RiSettings4Line,
  RiShieldCrossLine
} from 'react-icons/ri';

interface NavSection {
  title: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navSections: NavSection[] = [
  {
    title: 'PLATFORM',
    items: [
      { label: 'Overview', href: '/dashboard', icon: RiDashboard3Line },
      { label: 'Decoy Nodes', href: '/honeypots', icon: RiShieldCrossLine },
      { label: 'Threat Stream', href: '/events', icon: RiFingerprintLine },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Attacker DNA', href: '/alerts', icon: RiAlertLine },
      { label: 'Lure Studio', href: '/lures', icon: RiFileShield2Line },
    ],
  },
  {
    title: 'GOVERNANCE',
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
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'bg-white border-r border-slate-200/80 flex flex-col z-40 font-sans transition-all duration-200 ease-in-out shadow-xs relative shrink-0 h-full',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 translate-x-0'
            : 'fixed lg:relative -translate-x-full lg:translate-x-0 inset-y-0 left-0'
        )}
      >
        {/* Floating Desktop Collapse Toggle (EAK Digital Style) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex absolute right-0 translate-x-1/2 top-4.5 z-[60] w-7 h-7 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 items-center justify-center cursor-pointer transition-all duration-200 border border-white/20"
          >
            {collapsed ? <RiArrowRightSLine className="w-4 h-4 text-white" /> : <RiArrowLeftSLine className="w-4 h-4 text-white" />}
          </button>
        )}

        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="CipherNest Logo"
              className="w-9 h-9 object-contain flex-shrink-0 drop-shadow-md hover:scale-110 transition-transform duration-300 animate-pulse-glow"
            />
            {(!collapsed || mobileOpen) && (
              <div className="whitespace-nowrap transition-opacity">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm tracking-tight text-slate-900 uppercase">
                    CIPHER<span className="text-indigo-600">NEST</span>
                  </h1>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">
                    v1.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">ADVERSARIAL AI DEFENSE</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto overflow-x-hidden">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {(!collapsed || mobileOpen) ? (
                <h3 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2 whitespace-nowrap">
                  {section.title}
                </h3>
              ) : (
                <div className="h-[1px] bg-slate-200 my-2 mx-1" />
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
                      collapsed && !mobileOpen ? 'justify-center px-2' : ''
                    )}
                  >
                    <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-700')} />
                    {(!collapsed || mobileOpen) && (
                      <span className="whitespace-nowrap transition-opacity">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200/80 bg-white">
          {(!collapsed || mobileOpen) ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Logout Session</span>
              </span>
              <RiLogoutBoxRLine className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            </button>
          ) : (
            <div className="flex justify-center cursor-pointer" onClick={handleLogout} title="Click to Logout">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
