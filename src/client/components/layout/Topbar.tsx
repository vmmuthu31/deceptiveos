'use client';

import React, { useEffect, useState } from 'react';
import { RiBellLine, RiMenuLine, RiUser3Line } from 'react-icons/ri';

interface TopbarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobile?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobile,
}) => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = (await res.json()) as { user?: { name: string; email: string; role: string } };
          if (data.user) setCurrentUser(data.user);
        }
      } catch {
        // Handled silently
      }
    }
    loadUser();
  }, []);

  return (
    <header className="h-14 shrink-0 w-full bg-[#080D18] border-b border-[#152033] px-4 sm:px-6 flex items-center justify-between font-sans z-30 select-none">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            title="Open Menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>
        )}

        <div className="text-xs font-mono font-bold text-slate-300 hidden sm:flex items-center gap-2">
          <span>CipherNest v1.0.0</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Service Status Badges */}
        <div className="hidden xl:flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0C1322] border border-[#172338] text-[11px] font-mono">
            <span className="text-slate-400 font-sans">SSH Honeypot</span>
            <span className="text-slate-300 font-bold">2222</span>
            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0C1322] border border-[#172338] text-[11px] font-mono">
            <span className="text-slate-400 font-sans">Beacon Receiver</span>
            <span className="text-slate-300 font-bold">8001</span>
            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0C1322] border border-[#172338] text-[11px] font-mono">
            <span className="text-slate-400 font-sans">API Server</span>
            <span className="text-slate-300 font-bold">8000</span>
            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#10192A] cursor-pointer transition-colors">
          <RiBellLine className="w-4 h-4" />
          <span className="px-1 py-0.1 rounded-full bg-rose-500 text-white font-bold text-[9px] absolute -top-0.5 -right-0.5 border border-[#080D18]">
            12
          </span>
        </div>

        <div className="h-5 w-[1px] bg-[#172338] hidden sm:block" />

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center">
            <RiUser3Line className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <h4 className="font-semibold text-slate-200">
              {currentUser?.name || 'Operator'}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentUser?.email || 'admin@ciphernest.local'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
