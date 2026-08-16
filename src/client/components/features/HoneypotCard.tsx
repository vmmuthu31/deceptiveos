'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { HoneypotProfile } from '@/shared/types';
import React from 'react';
import { RiPlayFill, RiRefreshLine, RiStopFill, RiTerminalBoxLine } from 'react-icons/ri';

interface HoneypotCardProps {
  honeypot: HoneypotProfile;
  onToggleStatus: (id: string) => void;
}

export const HoneypotCard: React.FC<HoneypotCardProps> = ({ honeypot, onToggleStatus }) => {
  const isRunning = honeypot.status === 'active';

  return (
    <Card className="flex flex-col justify-between h-full font-sans">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <RiTerminalBoxLine className="w-4 h-4 text-indigo-400" />
              <CardTitle>{honeypot.name}</CardTitle>
            </div>
            <Badge variant={isRunning ? 'success' : 'danger'} dot>
              {isRunning ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>
          <CardDescription>
            Engine: <span className="font-mono text-slate-300 font-semibold">{honeypot.type}</span> | Port:{' '}
            <span className="font-mono text-indigo-300 font-medium">:{honeypot.port}</span>
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded bg-[#0B0E17] border border-[#1E293B] text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Jitter Jitter</span>
            <span className="text-slate-200 font-semibold">{honeypot.temporalJitterMs}ms</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Sessions</span>
            <span className="text-emerald-400 font-semibold">{honeypot.activeSessionsCount}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-sans">Telemetry</span>
            <span className="text-slate-300 font-semibold">{honeypot.totalEventsCount} events</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#1E293B] mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <RiRefreshLine className={`w-3.5 h-3.5 ${honeypot.twinSyncEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
          <span>Twin Sync: {honeypot.twinSyncEnabled ? 'ON' : 'OFF'}</span>
        </div>

        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          onClick={() => onToggleStatus(honeypot.id)}
        >
          {isRunning ? <RiStopFill className="w-3.5 h-3.5" /> : <RiPlayFill className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause Node' : 'Activate Node'}</span>
        </Button>
      </div>
    </Card>
  );
};

