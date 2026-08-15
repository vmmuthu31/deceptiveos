'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { HoneypotProfile } from '@/shared/types';
import React from 'react';
import { RiCpuLine, RiPlayFill, RiRefreshLine, RiStopFill, RiTerminalBoxLine } from 'react-icons/ri';

interface HoneypotCardProps {
  honeypot: HoneypotProfile;
  onToggleStatus: (id: string) => void;
}

export const HoneypotCard: React.FC<HoneypotCardProps> = ({ honeypot, onToggleStatus }) => {
  const isRunning = honeypot.status === 'active';

  return (
    <Card className="relative overflow-hidden group">
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <RiTerminalBoxLine className="w-5 h-5 text-emerald-400" />
            <CardTitle>{honeypot.name}</CardTitle>
          </div>
          <CardDescription>
            Port: <span className="font-mono text-slate-200">{honeypot.port}</span> | ID:{' '}
            <span className="font-mono text-slate-400">{honeypot.containerId}</span>
          </CardDescription>
        </div>
        <Badge variant={isRunning ? 'success' : 'danger'}>
          {isRunning ? 'Running' : 'Stopped'}
        </Badge>
      </CardHeader>

      <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-lg bg-slate-950/60 border border-slate-900 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">Jitter Latency</span>
          <span className="text-cyan-400 font-semibold">{honeypot.temporalJitterMs}ms</span>
        </div>
        <div>
          <span className="text-slate-500 block">Active Sessions</span>
          <span className="text-emerald-400 font-semibold">{honeypot.activeSessionsCount}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Events</span>
          <span className="text-slate-200 font-semibold">{honeypot.totalEventsCount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <RiRefreshLine className={`w-3.5 h-3.5 ${honeypot.twinSyncEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
          <span>Twin Sync: {honeypot.twinSyncEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>

        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          onClick={() => onToggleStatus(honeypot.id)}
        >
          {isRunning ? <RiStopFill className="w-4 h-4" /> : <RiPlayFill className="w-4 h-4" />}
          <span>{isRunning ? 'Stop Decoy' : 'Start Decoy'}</span>
        </Button>
      </div>
    </Card>
  );
};
