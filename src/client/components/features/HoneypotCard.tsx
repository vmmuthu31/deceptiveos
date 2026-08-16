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
    <Card className="flex flex-col justify-between h-full font-sans hover:shadow-md transition-all">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RiTerminalBoxLine className="w-4 h-4" />
              </div>
              <CardTitle className="font-bold text-slate-900">{honeypot.name}</CardTitle>
            </div>
            <Badge variant={isRunning ? 'success' : 'danger'} dot>
              {isRunning ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>
          <CardDescription>
            Engine: <span className="font-mono text-slate-700 font-semibold">{honeypot.type}</span> | Port:{' '}
            <span className="font-mono text-indigo-600 font-semibold">:{honeypot.port}</span>
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-3 gap-2 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Jitter Latency</span>
            <span className="text-slate-800 font-bold">{honeypot.temporalJitterMs}ms</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Sessions</span>
            <span className="text-emerald-600 font-bold">{honeypot.activeSessionsCount}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Telemetry</span>
            <span className="text-slate-800 font-bold">{honeypot.totalEventsCount} events</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <RiRefreshLine className={`w-4 h-4 ${honeypot.twinSyncEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="font-medium">Twin Sync: {honeypot.twinSyncEnabled ? 'ON' : 'OFF'}</span>
        </div>

        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          onClick={() => onToggleStatus(honeypot.id)}
          className="rounded-xl"
        >
          {isRunning ? <RiStopFill className="w-3.5 h-3.5" /> : <RiPlayFill className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause Node' : 'Activate Node'}</span>
        </Button>
      </div>
    </Card>
  );
};


