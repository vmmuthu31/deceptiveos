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
  RiGlobalLine,
  RiLogoutBoxRLine,
  RiNodeTree,
  RiRobot2Line,
  RiSafe2Line,
  RiSettings4Line,
  RiShieldCheckLine,
  RiShieldCrossLine,
  RiShieldKeyholeLine,
  RiShieldLine,
  RiSkull2Line,
  RiUser3Line,
} from 'react-icons/ri';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: RiDashboard3Line },
  { label: 'Events', href: '/events', icon: RiFingerprintLine },
  { label: 'Alerts', href: '/alerts', icon: RiAlertLine, badge: 12 },
  { label: 'Honeypots', href: '/honeypots', icon: RiShieldCrossLine },
  { label: 'Lures', href: '/lures', icon: RiFileShield2Line },
  { label: 'MCP Deception', href: '/mcp-deception', icon: RiRobot2Line },
  { label: 'Network Graph', href: '/network', icon: RiNodeTree },
  { label: 'Bounties', href: '/bounties', icon: RiShieldKeyholeLine },
  { label: 'Treasury', href: '/treasury', icon: RiSafe2Line },
  { label: 'Threat Intel', href: '/alerts', icon: RiGlobalLine },
  { label: 'Compliance', href: '/settings', icon: RiShieldCheckLine },
  { label: 'Containment', href: '/events', icon: RiSkull2Line },
  { label: 'Settings', href: '/settings', icon: RiSettings4Line },
];

const authNavItems: NavItem[] = [
  { label: 'Profile', href: '/settings', icon: RiUser3Line },
  { label: 'Logout', href: '#logout', icon: RiLogoutBoxRLine },
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
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'bg-[#080D18] border-r border-[#152033] flex flex-col z-40 font-sans transition-all duration-200 ease-in-out shadow-2xl relative shrink-0 h-full select-none',
          collapsed ? 'w-20' : 'w-60',
          mobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-60 translate-x-0'
            : 'fixed lg:relative -translate-x-full lg:translate-x-0 inset-y-0 left-0'
        )}
      >
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex absolute right-0 translate-x-1/2 top-4.5 z-50 w-6 h-6 rounded-md bg-purple-600 text-white shadow-md hover:bg-purple-700 items-center justify-center cursor-pointer transition-all border border-purple-400/40"
          >
            {collapsed ? <RiArrowRightSLine className="w-3.5 h-3.5 text-white" /> : <RiArrowLeftSLine className="w-3.5 h-3.5 text-white" />}
          </button>
        )}

        {/* Brand Logo Header */}
        <div className="h-16 px-4 border-b border-[#152033] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
              <RiShieldLine className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1 leading-tight">
                  CipherNest
                </h1>
                <p className="text-[10px] text-slate-400 font-sans tracking-tight truncate">
                  Adversarial Cyber Deception Platform
                </p>
              </div>
            )}
          </div>

          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#10192A]'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                  {(!collapsed || mobileOpen) && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {item.badge !== undefined && (!collapsed || mobileOpen) && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* AUTH Section */}
          {(!collapsed || mobileOpen) && (
            <div className="pt-2 border-t border-[#152033]">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider px-3 mb-1">
                AUTH
              </div>
              <div className="space-y-0.5">
                {authNavItems.map((item) => {
                  const Icon = item.icon;
                  if (item.href === '#logout') {
                    return (
                      <button
                        key={item.label}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-[#10192A] transition-colors"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#10192A] transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Card */}
        {(!collapsed || mobileOpen) && (
          <div className="p-3 border-t border-[#152033] bg-[#070B14]">
            <div className="p-2.5 rounded-lg bg-[#0C1322] border border-[#172338] space-y-1.5 text-[11px] font-sans">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">System Status</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Uptime</span>
                <span className="font-mono text-slate-200 font-semibold">2d 14h 32m</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Version</span>
                <span className="font-mono text-slate-400">1.0.0</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
