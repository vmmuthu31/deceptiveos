'use client';

import { EventFeed } from '@/client/components/features/EventFeed';
import { TerminalReplay } from '@/client/components/features/TerminalReplay';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { SessionEvent } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiAlertLine, RiBrainLine, RiFileShield2Line, RiFingerprintLine, RiPulseLine, RiShieldCrossLine } from 'react-icons/ri';

export default function DashboardPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | undefined>();

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json() as { events: SessionEvent[] };
          setEvents(data.events || []);
          if (data.events?.[0]) setSelectedEvent(data.events[0]);
        }
      } catch {
        // use fallback
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glow-emerald border border-emerald-900/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400">Active Decoy Nodes</span>
              <h2 className="text-2xl font-bold font-mono text-emerald-400 mt-1">2 / 3</h2>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <RiShieldCrossLine className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono mt-2 block">Living Twin Sync Active</span>
        </Card>

        <Card className="glow-cyan border border-cyan-900/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400">AI Agents Trapped</span>
              <h2 className="text-2xl font-bold font-mono text-cyan-400 mt-1">14</h2>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <RiBrainLine className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] text-cyan-400/80 font-mono mt-2 block">High Velocity Attackers</span>
        </Card>

        <Card className="glow-rose border border-rose-900/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400">Watermark Beacons</span>
              <h2 className="text-2xl font-bold font-mono text-rose-400 mt-1">6 Hits</h2>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-400">
              <RiFileShield2Line className="w-6 h-6" />
            </div>
          </div>
          <span className="text-[11px] text-rose-400/80 font-mono mt-2 block">Steganographic Callbacks</span>
        </Card>

        <Card className="border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400">Time Wasted (Temporal)</span>
              <h2 className="text-2xl font-bold font-mono text-slate-200 mt-1">142 min</h2>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <RiPulseLine className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-2 block">Avg 12.4 min per session</span>
        </Card>
      </div>

      {/* Main Grid: Events & Interactive Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Activity Feed */}
        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiAlertLine className="w-5 h-5 text-emerald-400" />
              <CardTitle>Live Attack Activity Stream</CardTitle>
            </div>
            <CardDescription>Real-time telemetry captured by local honeypot containers</CardDescription>
          </CardHeader>
          <EventFeed events={events} onSelectEvent={setSelectedEvent} />
        </div>

        {/* Right Column: SSH Counter-LLM Shell Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiFingerprintLine className="w-5 h-5 text-cyan-400" />
              <CardTitle>Counter-LLM Session Replay</CardTitle>
            </div>
            <CardDescription>Interactive terminal shell simulating dynamic honeypot responses</CardDescription>
          </CardHeader>
          <TerminalReplay initialEvent={selectedEvent} />
        </div>
      </div>
    </div>
  );
}
