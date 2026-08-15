'use client';

import { Badge } from '@/client/components/ui/Badge';
import { SessionEvent } from '@/shared/types';
import { formatTimestamp } from '@/shared/utils/formatters';
import React from 'react';
import { RiCommandLine, RiGlobalLine, RiTimeLine } from 'react-icons/ri';

interface EventFeedProps {
  events: SessionEvent[];
  onSelectEvent?: (event: SessionEvent) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({ events, onSelectEvent }) => {
  return (
    <div className="space-y-3">
      {events.map((evt) => {
        const getKindBadge = () => {
          switch (evt.kind) {
            case 'malware_drop':
              return <Badge variant="danger">Malware Drop</Badge>;
            case 'beacon_hit':
              return <Badge variant="warning">Beacon Callback</Badge>;
            case 'command_exec':
              return <Badge variant="info">Command Executed</Badge>;
            default:
              return <Badge variant="default">{evt.kind}</Badge>;
          }
        };

        return (
          <div
            key={evt.id}
            onClick={() => onSelectEvent?.(evt)}
            className="p-4 rounded-xl glass-card border border-slate-800/80 hover:border-emerald-700/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <RiCommandLine className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-xs text-slate-300 font-semibold">{evt.honeypotName}</span>
                {getKindBadge()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <RiTimeLine className="w-3.5 h-3.5" />
                <span>{formatTimestamp(evt.timestamp)}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-900 font-mono text-xs text-emerald-400 overflow-x-auto">
              <span className="text-slate-500 mr-2">$</span>
              {evt.payload}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <RiGlobalLine className="w-3.5 h-3.5 text-cyan-400" />
                <span>{evt.attackerIp}</span>
                <span className="text-slate-500">({evt.location})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Session ID: {evt.sessionId}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
