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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <RiFingerprintLine className="w-6 h-6 text-emerald-400" />
            Session Events & Command Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit log of all SSH shell commands, malware download drops, and steganographic beacon callbacks.
          </p>
        </div>

        <div className="relative w-72">
          <RiSearchLine className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search IP, payload, or decoy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <EventFeed events={filteredEvents} onSelectEvent={(e) => setSelectedEvent(e)} />
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-20 border border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiCommandLine className="w-5 h-5 text-cyan-400" />
                <CardTitle>Session Command Breakdown</CardTitle>
              </div>
              <CardDescription>
                {selectedEvent ? `Session ID: ${selectedEvent.sessionId}` : 'Select an event from the feed to inspect execution logs'}
              </CardDescription>
            </CardHeader>

            {selectedEvent ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-900 space-y-1">
                  <div><span className="text-slate-500">Attacker IP:</span> <span className="text-emerald-400 font-semibold">{selectedEvent.attackerIp}</span></div>
                  <div><span className="text-slate-500">Target Decoy:</span> <span className="text-slate-200">{selectedEvent.honeypotName}</span></div>
                  <div><span className="text-slate-500">Location:</span> <span className="text-cyan-400">{selectedEvent.location}</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 font-sans">Command Execution Log:</span>
                  {selectedEvent.commands.map((cmd) => (
                    <div key={cmd.id} className="p-3 rounded-lg bg-slate-950 border border-slate-900 space-y-1.5">
                      <div className="text-emerald-400 font-semibold flex items-center justify-between">
                        <span>$ {cmd.command}</span>
                        <span className="text-[10px] text-cyan-400">Entropy: {cmd.entropyScore}</span>
                      </div>
                      <pre className="text-slate-300 whitespace-pre-wrap text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
                        {cmd.output}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Click on any event card to analyze session command stack.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
