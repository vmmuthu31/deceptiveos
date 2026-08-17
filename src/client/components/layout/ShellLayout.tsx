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
    return <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased selection:bg-indigo-500 selection:text-white">{children}</div>;
  }

  return (
    <div className="flex h-screen min-h-dvh overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col relative bg-[#F8FAFC]">
        {}
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        {}
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-[#F8FAFC]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
