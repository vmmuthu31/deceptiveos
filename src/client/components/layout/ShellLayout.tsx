'use client';

import { Sidebar } from '@/client/components/layout/Sidebar';
import { Topbar } from '@/client/components/layout/Topbar';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ShellLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];

export const ShellLayout: React.FC<ShellLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#070B14] font-sans antialiased text-slate-100">{children}</div>;
  }

  return (
    <div className="flex h-screen min-h-dvh overflow-hidden bg-[#070B14] text-slate-100 font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col relative bg-[#070B14]">
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-[#070B14]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6 space-y-5">
            {children}
          </div>

          {/* Bottom Status Footer */}
          <footer className="h-8 shrink-0 border-t border-[#152033] bg-[#080D18] px-4 sm:px-6 flex items-center justify-between text-[11px] font-sans text-slate-400 select-none">
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                System running smoothly
              </span>
              <span>•</span>
              <span>Last backup: <strong className="text-slate-300">2 min ago</strong></span>
              <span>•</span>
              <span>Audit chain: <strong className="text-emerald-400">Verified (4582 blocks)</strong></span>
              <span>•</span>
              <span>Timezone: <strong className="text-slate-300 font-mono">UTC+0</strong></span>
            </div>

            <div className="hidden sm:block text-slate-500 font-mono text-[10px]">
              © 2024 CipherNest. All rights reserved.
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
