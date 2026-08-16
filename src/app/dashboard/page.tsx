'use client';

import { EventFeed } from '@/client/components/features/EventFeed';
import { TerminalReplay } from '@/client/components/features/TerminalReplay';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { SessionEvent } from '@/shared/types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  RiAlertLine,
  RiArrowRightSLine,
  RiBrainLine,
  RiCheckDoubleLine,
  RiFileShield2Line,
  RiFingerprintLine,
  RiPulseLine,
  RiRefreshLine,
  RiShieldCrossLine,
  RiSparklingLine
} from 'react-icons/ri';

export default function DashboardPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | undefined>();
  const [activeDecoys, setActiveDecoys] = useState({ active: 2, total: 3 });
  const [syncing, setSyncing] = useState(false);

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

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Executive Summary Hero Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <RiSparklingLine className="w-3.5 h-3.5" />
              <span>AI Defense Platform</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Executive Summary
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  className="rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer lg:hidden"
                >
                  <RiRefreshLine className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync Telemetry</span>
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
                Monitor active decoy volume, AI threat scanner captures, and steganographic lure beacons across your fleet.
              </p>
            </div>

            {/* Inline Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 max-w-md">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Active Decoys</span>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">{activeDecoys.active} <span className="text-xs text-slate-400 font-normal">/ {activeDecoys.total}</span></p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">AI Scanners</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">14</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Watermark Hits</span>
                <p className="text-xl font-bold text-indigo-600 mt-0.5">6</p>
              </div>
            </div>
          </div>

          {/* Right Activity Box */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                THIS WEEK'S DEFENSE
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                className="hidden lg:inline-flex rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 p-1.5"
              >
                <RiRefreshLine className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-300">Threat Sessions Captured</span>
                <span className="font-bold text-white font-mono">42</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-300">Malware Drops Trapped</span>
                <span className="font-bold text-white font-mono">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Canary Token Callbacks</span>
                <span className="font-bold text-indigo-400 font-mono">6</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Grid Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Active Decoy Fleet</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeDecoys.active}</h2>
              <p className="text-[11px] text-slate-400 mt-1">{activeDecoys.total} total containers active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <RiShieldCrossLine className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">AI Agents Trapped</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">14</h2>
              <p className="text-[11px] text-slate-400 mt-1">Autonomous scanners trapped</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <RiBrainLine className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Watermark Beacons</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">6</h2>
              <p className="text-[11px] text-slate-400 mt-1">Steganographic callbacks</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <RiFileShield2Line className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Time Wasted</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">142m</h2>
              <p className="text-[11px] text-slate-400 mt-1">Avg 12.4m per session</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <RiPulseLine className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2-Column Section: Quick Actions & Fleet Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Quick Defense Actions</CardTitle>
              <CardDescription>Start your next deception workflow</CardDescription>
            </CardHeader>

            <div className="space-y-3 mt-2">
              <Link href="/honeypots" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <RiShieldCrossLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Deploy New Decoy Node</h4>
                    <p className="text-[11px] text-slate-500">Spin up living SSH digital twin container</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link href="/lures" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <RiFileShield2Line className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Synthesize Steganographic Lure</h4>
                    <p className="text-[11px] text-slate-500">Embed zero-width token into honeypot document</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link href="/settings" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <RiCheckDoubleLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Verify Audit Ledger</h4>
                    <p className="text-[11px] text-slate-500">Validate cryptographic hash-chain compliance</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Fleet Health Progress Bars */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle>Deception Fleet Health</CardTitle>
            <CardDescription>Metrics across living decoy instances and AI inference engine</CardDescription>
          </CardHeader>

          <div className="space-y-4 mt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Digital Twin Sync Rate</span>
                <span className="text-emerald-600 font-bold font-mono">100%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Counter-LLM Inference Latency</span>
                <span className="text-indigo-600 font-bold font-mono">140 ms</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Steganographic Token Integrity</span>
                <span className="text-amber-600 font-bold font-mono">99.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[99%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Telemetry Events & Interactive Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiAlertLine className="w-4 h-4 text-indigo-600" />
              <CardTitle>Live Attack Telemetry Stream</CardTitle>
            </div>
            <CardDescription>Real-time incident feed captured across active decoy containers</CardDescription>
          </CardHeader>
          <EventFeed events={events} onSelectEvent={setSelectedEvent} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiFingerprintLine className="w-4 h-4 text-indigo-600" />
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


