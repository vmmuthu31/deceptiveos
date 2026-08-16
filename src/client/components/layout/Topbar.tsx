'use client';

import { Badge } from '@/client/components/ui/Badge';
import { cn } from '@/client/lib/utils';
import React, { useEffect, useState } from 'react';
import { RiCpuLine, RiGlobalLine, RiMenuLine, RiPulseLine, RiSearchLine, RiShieldFlashLine } from 'react-icons/ri';

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
    model: 'llama3.1:8b',
  });
  const [environment, setEnvironment] = useState('Local Air-Gapped Cluster');

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
    checkHealth();
  }, []);

  return (
    <header
      className={cn(
        'h-14 fixed top-0 right-0 z-30 bg-[#0F1626] border-b border-[#1E293B] px-4 sm:px-6 flex items-center justify-between font-sans transition-[left] duration-200 ease-in-out',
        collapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            title="Open Menu"
            className="lg:hidden p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#1E293B] cursor-pointer"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>
        )}

        {/* Environment Cluster Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-[#0B0E17] px-2.5 py-1 rounded border border-[#1E293B]">
          <RiGlobalLine className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium pr-1"
          >
            <option value="Local Air-Gapped Cluster" className="bg-[#0F1626]">Air-Gapped Local</option>
            <option value="Staging VPC Decoys" className="bg-[#0F1626]">Staging VPC (us-east-1)</option>
            <option value="Production Decoy Fleet" className="bg-[#0F1626]">Production Fleet (eu-central-1)</option>
          </select>
        </div>

        <div className="hidden md:block h-4 w-[1px] bg-[#1E293B]" />

        <div className="flex items-center gap-2">
          <RiShieldFlashLine className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="hidden xl:inline text-xs font-medium text-slate-300">Defense State:</span>
          <Badge variant="success" dot className="py-0.5 px-2 text-[10px]">ACTIVE DECOYS (2)</Badge>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden xl:flex items-center gap-2 bg-[#0B0E17] border border-[#1E293B] px-3 py-1 rounded text-xs text-slate-400 w-56">
        <RiSearchLine className="w-3.5 h-3.5 text-slate-500" />
        <span className="flex-1 text-slate-500 truncate">Search telemetry, IPs...</span>
        <kbd className="text-[9px] font-mono bg-[#1E293B] text-slate-400 px-1 py-0.2 rounded border border-slate-700">⌘K</kbd>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#0B0E17] px-2.5 py-1 rounded border border-[#1E293B]">
          <RiCpuLine className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">LLM:</span>
          <span className="text-slate-200 font-semibold">{ollamaStatus.model}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#0B0E17] px-2.5 py-1 rounded border border-[#1E293B]">
          <RiPulseLine className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline text-slate-400">Threat:</span>
          <span className="text-amber-400 font-semibold">Elevated</span>
        </div>
      </div>
    </header>
  );
};


