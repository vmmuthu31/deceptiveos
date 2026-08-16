'use client';

import { Button } from '@/client/components/ui/Button';
import { cn } from '@/client/lib/utils';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiBellLine, RiCpuLine, RiGlobalLine, RiMenuLine, RiSearchLine, RiUser3Line } from 'react-icons/ri';

interface TopbarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobile?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  collapsed = false,
  onOpenMobile,
}) => {
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; model: string }>({
    available: true,
    model: 'opencode/mimo-v2.5-free',
  });
  const [environment, setEnvironment] = useState('Local Air-Gapped Cluster');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/ollama');
        if (res.ok) {
          const data = await res.json() as { health?: { available: boolean; model: string } };
          if (data.health) setOllamaStatus(data.health);
        }
      } catch {
        // fallback
      }
    }
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json() as { user?: { name: string; email: string; role: string } };
          if (data.user) setCurrentUser(data.user);
        }
      } catch {
        // fallback
      }
    }
    checkHealth();
    loadUser();
  }, []);

  return (
    <header className="h-16 shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between font-sans z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            title="Open Menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>
        )}

        {/* Integrated Search Bar */}
        <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs text-slate-600 w-56 sm:w-64 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <RiSearchLine className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages, IPs, lures..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
          />
          <kbd className="hidden sm:inline text-[9px] font-mono bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* LLM Model Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
          <RiCpuLine className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-400 font-sans">LLM:</span>
          <span className="font-semibold text-slate-900">{ollamaStatus.model}</span>
        </div>

        {/* Cluster Selector */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
          <RiGlobalLine className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-transparent text-slate-800 text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="Local Air-Gapped Cluster">Cluster: Air-Gapped Local</option>
            <option value="Staging VPC Decoys">Cluster: Staging VPC</option>
            <option value="Production Decoy Fleet">Cluster: Production Fleet</option>
          </select>
        </div>

        {/* Primary Deploy Button */}
        <a href="/honeypots">
          <Button size="sm" variant="primary" className="rounded-xl shadow-xs text-xs font-semibold">
            <RiAddLine className="w-4 h-4" />
            <span className="hidden sm:inline">DEPLOY DECOY</span>
          </Button>
        </a>

        {/* Notification Bell */}
        <div className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
          <RiBellLine className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 border-2 border-white" />
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Dynamic User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-indigo-400/40">
            <RiUser3Line className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser ? currentUser.name : 'Security Analyst'}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider block font-semibold uppercase">
              {currentUser ? currentUser.role : 'ANALYST'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};



