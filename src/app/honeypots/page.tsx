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
        // fallback
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
      // fallback
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
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <RiShieldCrossLine className="w-6 h-6 text-emerald-400" />
            Honeypot Decoy Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deploy local containers and maintain self-updating Digital Twin decoys matching real environment metadata.
          </p>
        </div>
        <Button onClick={() => setCreating(!creating)}>
          <RiAddLine className="w-4 h-4" />
          <span>{creating ? 'Cancel' : 'Deploy New Decoy'}</span>
        </Button>
      </div>

      {/* New Honeypot Form Drawer */}
      {creating && (
        <Card className="border border-emerald-800/60 glow-emerald">
          <CardHeader>
            <CardTitle>Deploy New Cyber Decoy Container</CardTitle>
            <CardDescription>Configure local honeypot container type, port binding, and temporal jitter.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateHoneypot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Decoy Name</label>
              <input
                type="text"
                value={newHpName}
                onChange={(e) => setNewHpName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Honeypot Engine</label>
              <select
                value={newHpType}
                onChange={(e) => setNewHpType(e.target.value as 'Cowrie' | 'Dionaea' | 'CustomLLM')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              >
                <option value="CustomLLM">CustomLLM (AI Counter-LLM SSH)</option>
                <option value="Cowrie">Cowrie (SSH/Telnet Trap)</option>
                <option value="Dionaea">Dionaea (Malware Capture)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Port</label>
              <input
                type="number"
                value={newHpPort}
                onChange={(e) => setNewHpPort(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <Button type="submit" variant="primary">Launch Container</Button>
          </form>
        </Card>
      )}

      {/* Honeypots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {honeypots.map((hp) => (
          <HoneypotCard key={hp.id} honeypot={hp} onToggleStatus={handleToggleStatus} />
        ))}
      </div>

      {/* Digital Twin Metadata Reader Section */}
      <Card className="border border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <RiRefreshLine className="w-5 h-5 text-cyan-400" />
              <CardTitle>Living Digital Twin Metadata Scanner</CardTitle>
            </div>
            <Badge variant="success">Read-Only Safe Sync</Badge>
          </div>
          <CardDescription>
            Scans local host directory structures and version strings to ensure honeypot profiles automatically match production conventions.
          </CardDescription>
        </CardHeader>

        {twinMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs p-4 rounded-lg bg-slate-950/80 border border-slate-900">
            <div>
              <span className="text-slate-500 block">Host OS Architecture</span>
              <span className="text-slate-200 font-semibold">{twinMetadata.osRelease} ({twinMetadata.architecture})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Active Ports Scanned</span>
              <span className="text-cyan-400 font-semibold">{twinMetadata.activePortRange}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Host Name Pattern</span>
              <span className="text-emerald-400 font-semibold">{twinMetadata.hostname}</span>
            </div>

            <div className="md:col-span-3 pt-2 border-t border-slate-900">
              <span className="text-slate-500 block mb-1.5 flex items-center gap-1">
                <RiCpuLine className="w-3.5 h-3.5 text-cyan-400" /> Environment Directories Mirrored in Decoy:
              </span>
              <div className="flex flex-wrap gap-2">
                {twinMetadata.directoryNaming.map((dir) => (
                  <span key={dir} className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
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
