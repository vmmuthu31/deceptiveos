'use client';

import { Sidebar } from '@/client/components/layout/Sidebar';
import { Topbar } from '@/client/components/layout/Topbar';
import { cn } from '@/client/lib/utils';
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

  // Close mobile drawer on route change or screen resize
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Topbar Component */}
      <Topbar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenMobile={() => setMobileOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'pt-20 min-h-screen transition-[padding] duration-200 ease-in-out p-4 sm:p-6 lg:p-8',
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

