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
    <div className="space-y-3 font-sans">
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
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <RiCommandLine className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs text-slate-900 font-bold">{evt.honeypotName}</span>
                {getKindBadge()}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <RiTimeLine className="w-3.5 h-3.5" />
                <span>{formatTimestamp(evt.timestamp)}</span>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed shadow-inner">
              <span className="text-slate-500 select-none mr-2">$</span>
              {evt.payload}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <RiGlobalLine className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-slate-800 font-semibold">{evt.attackerIp}</span>
                <span className="text-slate-400">({evt.location})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">T1059.004</span>
                <span className="text-slate-400 text-[10px]">Session #{evt.sessionId.slice(-6)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


