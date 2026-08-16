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
    <div className="space-y-2.5 font-sans">
      {events.map((evt) => {
        const getKindBadge = () => {
          switch (evt.kind) {
            case 'malware_drop':
              return <Badge variant="critical" dot>CRITICAL DROP</Badge>;
            case 'beacon_hit':
              return <Badge variant="high" dot>BEACON CALLBACK</Badge>;
            case 'command_exec':
              return <Badge variant="medium" dot>EXECUTION</Badge>;
            default:
              return <Badge variant="info" dot>{evt.kind.toUpperCase()}</Badge>;
          }
        };

        return (
          <div
            key={evt.id}
            onClick={() => onSelectEvent?.(evt)}
            className="p-3.5 rounded-lg bg-[#131B2E] border border-[#1E293B] hover:border-[#3B82F6]/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <RiCommandLine className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs text-slate-200 font-semibold">{evt.honeypotName}</span>
                {getKindBadge()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <RiTimeLine className="w-3.5 h-3.5" />
                <span>{formatTimestamp(evt.timestamp)}</span>
              </div>
            </div>

            <div className="bg-[#0B0E17] rounded p-2.5 border border-[#1E293B] font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <span className="text-slate-500 select-none mr-2">$</span>
              {evt.payload}
            </div>

            <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <RiGlobalLine className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-200 font-medium">{evt.attackerIp}</span>
                <span className="text-slate-500">({evt.location})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-slate-300">T1059.004</span>
                <span className="text-slate-500">Session #{evt.sessionId.slice(-6)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

