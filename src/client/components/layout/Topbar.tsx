'use client';

import { Badge } from '@/client/components/ui/Badge';
import React, { useEffect, useState } from 'react';
import { RiCpuLine, RiPulseLine, RiShieldFlashLine } from 'react-icons/ri';

export const Topbar: React.FC = () => {
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; model: string }>({
    available: true,
    model: 'llama3.1:8b',
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/ollama');
        if (res.ok) {
          const data = await res.json() as { health?: { available: boolean; model: string } };
          if (data.health) setOllamaStatus(data.health);
        }
      } catch {
        // keep fallback
      }
    }
    checkHealth();
  }, []);

  return (
    <header className="h-16 fixed top-0 right-0 left-64 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <RiShieldFlashLine className="w-5 h-5 text-emerald-400" />
        <span className="text-sm font-semibold text-slate-200">System Defense Telemetry</span>
        <Badge variant="success">Active Decoys Running</Badge>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <RiCpuLine className="w-4 h-4 text-cyan-400" />
          <span>Local AI Model:</span>
          <span className="text-slate-200 font-semibold">{ollamaStatus.model}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <RiPulseLine className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Threat Level:</span>
          <span className="text-emerald-400 font-semibold">Elevated (Decoys Active)</span>
        </div>
      </div>
    </header>
  );
};
