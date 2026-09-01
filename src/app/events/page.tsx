'use client';

import { AttackGraphVisualizer } from '@/client/components/features/AttackGraphVisualizer';
import { EventFeed } from '@/client/components/features/EventFeed';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { SessionEvent } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiCommandLine, RiFingerprintLine, RiSearchLine } from 'react-icons/ri';

export default function EventsPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json() as { events: SessionEvent[] };
          setEvents(data.events || []);
        }
      } catch {

      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter(
    (e) =>
      e.attackerIp.includes(search) ||
      e.payload.toLowerCase().includes(search.toLowerCase()) ||
      e.honeypotName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RiFingerprintLine className="w-5 h-5" />
            </div>
            Threat Telemetry & Session Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit stream of all SSH shell executions, malware drop attempts, and canary beacon callbacks.
          </p>
        </div>

        <div className="relative w-72">
          <RiSearchLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search IP, payload, or decoy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      {/* Correlated Multi-Stage Attack Graph */}
      <AttackGraphVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <EventFeed events={filteredEvents} onSelectEvent={(e) => setSelectedEvent(e)} />
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <RiCommandLine className="w-4 h-4" />
                </div>
                <CardTitle className="font-bold text-slate-900">Session Command Trace</CardTitle>
              </div>
              <CardDescription>
                {selectedEvent ? `Session ID: ${selectedEvent.sessionId}` : 'Select an incident from the stream to inspect execution logs'}
              </CardDescription>
            </CardHeader>

            {selectedEvent ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div><span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Attacker IP:</span> <span className="text-indigo-600 font-bold">{selectedEvent.attackerIp}</span></div>
                  <div><span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Decoy Target:</span> <span className="text-slate-900 font-semibold">{selectedEvent.honeypotName}</span></div>
                  <div><span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Geo Location:</span> <span className="text-slate-700 font-medium">{selectedEvent.location}</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 font-sans">Command Execution History:</span>
                  {selectedEvent.commands.map((cmd) => (
                    <div key={cmd.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-xs">
                      <div className="text-emerald-400 font-semibold flex items-center justify-between text-xs">
                        <span>$ {cmd.command}</span>
                        <span className="text-[10px] text-slate-400 font-normal">Entropy: {cmd.entropyScore}</span>
                      </div>
                      <pre className="text-slate-300 whitespace-pre-wrap text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        {cmd.output}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                Click on any event card to inspect session stack.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


