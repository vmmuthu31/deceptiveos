'use client';

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
        // fallback
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
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <RiFingerprintLine className="w-5 h-5 text-indigo-400" />
            Threat Telemetry & Session Events
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit stream of all SSH shell executions, malware drop attempts, and canary beacon callbacks.
          </p>
        </div>

        <div className="relative w-72">
          <RiSearchLine className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search IP, payload, or decoy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0B0E17] border border-[#1E293B] rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <EventFeed events={filteredEvents} onSelectEvent={(e) => setSelectedEvent(e)} />
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiCommandLine className="w-4 h-4 text-indigo-400" />
                <CardTitle>Session Command Trace</CardTitle>
              </div>
              <CardDescription>
                {selectedEvent ? `Session ID: ${selectedEvent.sessionId}` : 'Select an incident from the stream to inspect execution logs'}
              </CardDescription>
            </CardHeader>

            {selectedEvent ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded bg-[#0B0E17] border border-[#1E293B] space-y-1">
                  <div><span className="text-slate-500 text-[10px] uppercase font-sans">Attacker IP:</span> <span className="text-indigo-300 font-semibold">{selectedEvent.attackerIp}</span></div>
                  <div><span className="text-slate-500 text-[10px] uppercase font-sans">Decoy Target:</span> <span className="text-slate-200">{selectedEvent.honeypotName}</span></div>
                  <div><span className="text-slate-500 text-[10px] uppercase font-sans">Geo Location:</span> <span className="text-slate-300">{selectedEvent.location}</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-medium text-slate-400 font-sans">Command Execution History:</span>
                  {selectedEvent.commands.map((cmd) => (
                    <div key={cmd.id} className="p-2.5 rounded bg-[#0B0E17] border border-[#1E293B] space-y-1">
                      <div className="text-emerald-400 font-semibold flex items-center justify-between">
                        <span>$ {cmd.command}</span>
                        <span className="text-[10px] text-slate-400 font-normal">Entropy: {cmd.entropyScore}</span>
                      </div>
                      <pre className="text-slate-300 whitespace-pre-wrap text-[11px] bg-[#0F1626] p-2 rounded border border-slate-800">
                        {cmd.output}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Click on any event card to inspect session stack.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

