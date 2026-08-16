'use client';

import { EventFeed } from '@/client/components/features/EventFeed';
import { TerminalReplay } from '@/client/components/features/TerminalReplay';
import { Badge } from '@/client/components/ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { SessionEvent } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiAlertLine, RiBrainLine, RiFileShield2Line, RiFingerprintLine, RiPulseLine, RiShieldCrossLine } from 'react-icons/ri';

export default function DashboardPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | undefined>();
  const [activeDecoys, setActiveDecoys] = useState({ active: 2, total: 3 });

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json() as { events: SessionEvent[] };
          setEvents(data.events || []);
          if (data.events?.[0]) setSelectedEvent(data.events[0]);
        }

        const hpRes = await fetch('/api/honeypots');
        if (hpRes.ok) {
          const hpData = await hpRes.json() as { honeypots: { status: string }[] };
          if (hpData.honeypots) {
            const activeCount = hpData.honeypots.filter((h) => h.status === 'active').length;
            setActiveDecoys({ active: activeCount, total: hpData.honeypots.length });
          }
        }
      } catch {
        // fallback
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Decoy Nodes</span>
              <h2 className="text-2xl font-bold font-mono text-slate-100 mt-1">{activeDecoys.active} / {activeDecoys.total}</h2>
            </div>
            <div className="p-2.5 rounded bg-[#0B0E17] border border-[#1E293B] text-emerald-400">
              <RiShieldCrossLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Twin Sync Status</span>
            <Badge variant="success" dot>SYNCHRONIZED</Badge>
          </div>
        </Card>

        <Card className="border-t-2 border-t-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">AI Scanners Trapped</span>
              <h2 className="text-2xl font-bold font-mono text-slate-100 mt-1">14</h2>
            </div>
            <div className="p-2.5 rounded bg-[#0B0E17] border border-[#1E293B] text-indigo-400">
              <RiBrainLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">LLM Threat Agent</span>
            <Badge variant="critical" dot>HIGH VELOCITY</Badge>
          </div>
        </Card>

        <Card className="border-t-2 border-t-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Steganographic Beacons</span>
              <h2 className="text-2xl font-bold font-mono text-slate-100 mt-1">6 Hits</h2>
            </div>
            <div className="p-2.5 rounded bg-[#0B0E17] border border-[#1E293B] text-amber-400">
              <RiFileShield2Line className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Token Callbacks</span>
            <Badge variant="warning" dot>TRACKING LIVE</Badge>
          </div>
        </Card>

        <Card className="border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Time Wasted (Temporal)</span>
              <h2 className="text-2xl font-bold font-mono text-slate-100 mt-1">142 min</h2>
            </div>
            <div className="p-2.5 rounded bg-[#0B0E17] border border-[#1E293B] text-blue-400">
              <RiPulseLine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Avg Jitter / Session</span>
            <span className="text-slate-300 font-semibold">12.4 min</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Telemetry Events & Interactive Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiAlertLine className="w-4 h-4 text-indigo-400" />
              <CardTitle>Live Attack Telemetry Stream</CardTitle>
            </div>
            <CardDescription>Real-time incident feed captured across active decoy containers</CardDescription>
          </CardHeader>
          <EventFeed events={events} onSelectEvent={setSelectedEvent} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiFingerprintLine className="w-4 h-4 text-indigo-400" />
              <CardTitle>Counter-LLM Session Shell</CardTitle>
            </div>
            <CardDescription>Interactive terminal shell simulating living honeypot responses</CardDescription>
          </CardHeader>
          <TerminalReplay initialEvent={selectedEvent} />
        </div>
      </div>
    </div>
  );
}

