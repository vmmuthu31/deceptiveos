'use client';

import { HoneypotCard } from '@/client/components/features/HoneypotCard';
import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { HoneypotProfile, TwinSyncMetadata } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiCpuLine, RiRefreshLine, RiShieldCrossLine } from 'react-icons/ri';

export default function HoneypotsPage() {
  const [honeypots, setHoneypots] = useState<HoneypotProfile[]>([]);
  const [twinMetadata, setTwinMetadata] = useState<TwinSyncMetadata | null>(null);
  const [creating, setCreating] = useState(false);
  const [newHpName, setNewHpName] = useState('Production DB Decoy');
  const [newHpType, setNewHpType] = useState<'Cowrie' | 'Dionaea' | 'CustomLLM'>('CustomLLM');
  const [newHpPort, setNewHpPort] = useState(2224);

  useEffect(() => {
    async function loadData() {
      try {
        const hpRes = await fetch('/api/honeypots');
        if (hpRes.ok) {
          const hpData = await hpRes.json() as { honeypots: HoneypotProfile[] };
          setHoneypots(hpData.honeypots || []);
        }

        const twinRes = await fetch('/api/honeypots/twin');
        if (twinRes.ok) {
          const twinData = await twinRes.json() as { metadata: TwinSyncMetadata };
          setTwinMetadata(twinData.metadata || null);
        }
      } catch {

      }
    }
    loadData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch('/api/honeypots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json() as { honeypot: HoneypotProfile };
        setHoneypots((prev) => prev.map((h) => (h.id === id ? data.honeypot : h)));
      }
    } catch {

    }
  };

  const handleCreateHoneypot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/honeypots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHpName,
          type: newHpType,
          port: Number(newHpPort),
          temporalJitterMs: 400,
          twinSyncEnabled: true,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { honeypot: HoneypotProfile };
        setHoneypots((prev) => [...prev, data.honeypot]);
        setCreating(false);
      }
    } catch {

    }
  };

  return (
    <div className="space-y-6 font-sans">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RiShieldCrossLine className="w-5 h-5" />
            </div>
            Decoy Node Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deploy local decoy containers and maintain self-updating Digital Twin nodes matching production metadata.
          </p>
        </div>
        <Button onClick={() => setCreating(!creating)} variant="primary" className="rounded-xl font-semibold">
          <RiAddLine className="w-4 h-4" />
          <span>{creating ? 'Close Form' : 'Deploy New Decoy'}</span>
        </Button>
      </div>

      {}
      {creating && (
        <Card className="border-indigo-200 shadow-sm">
          <CardHeader>
            <CardTitle>Deploy Decoy Cyber Container</CardTitle>
            <CardDescription>Configure local honeypot container type, port binding, and temporal jitter.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateHoneypot} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Decoy Name</label>
              <input
                type="text"
                value={newHpName}
                onChange={(e) => setNewHpName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Honeypot Engine</label>
              <select
                value={newHpType}
                onChange={(e) => setNewHpType(e.target.value as 'Cowrie' | 'Dionaea' | 'CustomLLM')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="CustomLLM">CustomLLM (AI Counter-LLM SSH)</option>
                <option value="Cowrie">Cowrie (SSH/Telnet Trap)</option>
                <option value="Dionaea">Dionaea (Malware Capture)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
              <input
                type="number"
                value={newHpPort}
                onChange={(e) => setNewHpPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="rounded-xl font-semibold">Launch Container</Button>
          </form>
        </Card>
      )}

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {honeypots.map((hp) => (
          <HoneypotCard key={hp.id} honeypot={hp} onToggleStatus={handleToggleStatus} />
        ))}
      </div>

      {}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RiRefreshLine className="w-4 h-4" />
              </div>
              <CardTitle>Living Digital Twin Metadata Scanner</CardTitle>
            </div>
            <Badge variant="success" dot>READ-ONLY SAFE SYNC</Badge>
          </div>
          <CardDescription>
            Scans local host directory structures and version strings to ensure honeypot profiles automatically match production conventions.
          </CardDescription>
        </CardHeader>

        {twinMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Host Architecture</span>
              <span className="text-slate-900 font-bold">{twinMetadata.osRelease} ({twinMetadata.architecture})</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Active Ports Scanned</span>
              <span className="text-indigo-600 font-bold">{twinMetadata.activePortRange}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Host Name Pattern</span>
              <span className="text-emerald-600 font-bold">{twinMetadata.hostname}</span>
            </div>

            <div className="md:col-span-3 pt-3 border-t border-slate-200/80">
              <span className="text-slate-500 text-[10px] uppercase mb-1.5 flex items-center gap-1 font-sans font-semibold">
                <RiCpuLine className="w-4 h-4 text-indigo-600" /> Environment Directories Mirrored in Decoy:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {twinMetadata.directoryNaming.map((dir) => (
                  <span key={dir} className="px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-semibold">
                    /{dir}/
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


