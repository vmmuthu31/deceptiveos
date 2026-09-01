'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RiArrowRightUpLine,
  RiCheckLine,
  RiFileShield2Line,
  RiFlashlightLine,
  RiFullscreenLine,
  RiRadio2Line,
  RiRobot2Line,
  RiShieldCheckLine,
  RiShieldCrossLine,
  RiShieldKeyholeLine,
  RiSpeedUpLine,
  RiUser3Line,
  RiZoomInLine,
  RiZoomOutLine,
} from 'react-icons/ri';

export default function DashboardPage() {
  const [mapTimeframe, setMapTimeframe] = useState('24 Hours');
  const [mapZoom, setMapZoom] = useState(1);

  return (
    <div className="space-y-5 font-sans select-none text-slate-100 pb-2">
      {/* Dashboard Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time overview of your deception network
        </p>
      </div>

      {/* Row 1: 6 Top KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Events */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Total Events</span>
            <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <RiFlashlightLine className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">1,247</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
            <RiArrowRightUpLine className="w-3 h-3" />
            <span>23.5% vs last 24h</span>
          </div>
        </div>

        {/* Active Attackers */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Active Attackers</span>
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <RiUser3Line className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">89</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 mt-1">
            <RiArrowRightUpLine className="w-3 h-3" />
            <span>15.3% vs last 24h</span>
          </div>
        </div>

        {/* Honeypot Breaches */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Honeypot Breaches</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <RiShieldCrossLine className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">34</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 mt-1">
            <RiArrowRightUpLine className="w-3 h-3" />
            <span>41.7% vs last 24h</span>
          </div>
        </div>

        {/* Beacon Callbacks */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Beacon Callbacks</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <RiRadio2Line className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">27</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
            <RiArrowRightUpLine className="w-3 h-3" />
            <span>28.6% vs last 24h</span>
          </div>
        </div>

        {/* MCP Tool Hits */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">MCP Tool Hits</span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <RiRobot2Line className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">19</div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-purple-400 mt-1">
            <RiArrowRightUpLine className="w-3 h-3" />
            <span>90.0% vs last 24h</span>
          </div>
        </div>

        {/* Risk Score (Global) */}
        <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#172338] hover:border-[#1E2D4A] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">Risk Score (Global)</span>
            <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <RiSpeedUpLine className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">78 <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-1">
            HIGH RISK
          </div>
        </div>
      </div>

      {/* Row 2: Live Attack Map (Left) & Attacker Fingerprinting Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Attack Map Card (8 of 12 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 z-10">
            <h3 className="text-sm font-semibold text-white">Live Attack Map</h3>

            <div className="flex items-center gap-2">
              <select
                value={mapTimeframe}
                onChange={(e) => setMapTimeframe(e.target.value)}
                className="px-2.5 py-1 rounded-md bg-[#070B14] border border-[#172338] text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="24 Hours">24 Hours</option>
                <option value="7 Days">7 Days</option>
                <option value="30 Days">30 Days</option>
              </select>

              <div className="flex items-center bg-[#070B14] border border-[#172338] rounded-md overflow-hidden text-slate-400">
                <button
                  onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}
                  className="p-1 hover:text-white hover:bg-[#10192A]"
                  title="Zoom In"
                >
                  <RiZoomInLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.8))}
                  className="p-1 hover:text-white hover:bg-[#10192A]"
                  title="Zoom Out"
                >
                  <RiZoomOutLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapZoom(1)}
                  className="p-1 hover:text-white hover:bg-[#10192A]"
                  title="Reset Zoom"
                >
                  <RiFullscreenLine className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* SVG World Map Vector with Attack Arcs & Nodes */}
            <div className="md:col-span-8 relative h-64 sm:h-72 w-full flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 800 400"
                className="w-full h-full opacity-90 transition-transform duration-300"
                style={{ transform: `scale(${mapZoom})` }}
              >
                {/* World Map Land Mass Silhouettes */}
                <path
                  d="M120,90 Q150,70 200,80 Q220,110 200,160 Q170,180 140,150 Q110,130 120,90 Z"
                  fill="#121D33"
                />
                <path
                  d="M210,190 Q240,190 250,240 Q230,310 190,320 Q180,260 210,190 Z"
                  fill="#121D33"
                />
                <path
                  d="M400,80 Q460,70 480,100 Q470,140 430,150 Q390,130 400,80 Z"
                  fill="#121D33"
                />
                <path
                  d="M410,160 Q460,170 470,230 Q440,280 400,260 Q380,200 410,160 Z"
                  fill="#121D33"
                />
                <path
                  d="M510,70 Q650,60 700,100 Q720,150 660,180 Q580,170 520,130 Z"
                  fill="#121D33"
                />
                <path
                  d="M620,230 Q680,220 700,260 Q670,300 620,280 Z"
                  fill="#121D33"
                />

                {/* Animated Attack Curved Arcs */}
                <path
                  d="M180,120 Q350,60 560,110"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />
                <path
                  d="M640,100 Q450,140 230,230"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
                <path
                  d="M440,110 Q500,180 570,140"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                />
                <path
                  d="M600,140 Q400,160 190,120"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.2"
                />
                <path
                  d="M560,110 Q400,260 210,250"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                />

                {/* Glowing Threat Nodes */}
                <circle cx="180" cy="120" r="5" fill="#F43F5E" />
                <circle cx="180" cy="120" r="10" fill="#F43F5E" opacity="0.3" className="animate-ping" />

                <circle cx="640" cy="100" r="4.5" fill="#F43F5E" />
                <circle cx="640" cy="100" r="9" fill="#F43F5E" opacity="0.3" />

                <circle cx="560" cy="110" r="4" fill="#F43F5E" />
                <circle cx="440" cy="110" r="3.5" fill="#F59E0B" />
                <circle cx="600" cy="140" r="3.5" fill="#10B981" />
                <circle cx="230" cy="230" r="4" fill="#F43F5E" />
                <circle cx="210" cy="250" r="3.5" fill="#F59E0B" />
              </svg>

              {/* Map Legend on bottom-left */}
              <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] font-sans bg-[#070B14]/80 px-2.5 py-1 rounded-md border border-[#172338]">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> High Threat
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Threat
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Threat
                </span>
              </div>
            </div>

            {/* Top Attacker Countries Sidebar inside Map Card */}
            <div className="md:col-span-4 p-3 rounded-xl bg-[#070B14] border border-[#172338] flex flex-col justify-between h-full">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Top Attacker Countries
                </span>
                <div className="space-y-1.5 text-xs font-sans">
                  {[
                    { flag: '🇺🇸', name: 'United States', count: 32 },
                    { flag: '🇨🇳', name: 'China', count: 18 },
                    { flag: '🇷🇺', name: 'Russia', count: 12 },
                    { flag: '🇩🇪', name: 'Germany', count: 7 },
                    { flag: '🇳🇱', name: 'Netherlands', count: 6 },
                    { flag: '🇸🇬', name: 'Singapore', count: 4 },
                    { flag: '🇮🇳', name: 'India', count: 3 },
                    { flag: '🇧🇷', name: 'Brazil', count: 2 },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-slate-300 py-0.5">
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/events"
                className="mt-3 block text-center py-1.5 rounded-lg bg-[#0C1322] hover:bg-[#141E33] border border-[#172338] text-[11px] font-semibold text-slate-300 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Attacker Fingerprinting Donut Card (4 of 12 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Attacker Fingerprinting (Top 5)
            </h3>

            {/* Donut Chart Visual & Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-2">
              {/* SVG Donut Chart */}
              <div className="sm:col-span-6 relative flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#121D33" strokeWidth="14" fill="none" />
                  {/* Cybercriminal 34.8% (Red) */}
                  <circle cx="50" cy="50" r="38" stroke="#F43F5E" strokeWidth="14" strokeDasharray="83 238" strokeDashoffset="0" fill="none" />
                  {/* Nation-State 27.0% (Purple) */}
                  <circle cx="50" cy="50" r="38" stroke="#8B5CF6" strokeWidth="14" strokeDasharray="64 238" strokeDashoffset="-83" fill="none" />
                  {/* Script-Kiddie 20.2% (Amber) */}
                  <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="14" strokeDasharray="48 238" strokeDashoffset="-147" fill="none" />
                  {/* Researcher 11.2% (Emerald) */}
                  <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="14" strokeDasharray="27 238" strokeDashoffset="-195" fill="none" />
                  {/* Unknown 6.7% (Slate) */}
                  <circle cx="50" cy="50" r="38" stroke="#64748B" strokeWidth="14" strokeDasharray="16 238" strokeDashoffset="-222" fill="none" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-bold font-mono text-white block">89</span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="sm:col-span-6 space-y-2 text-[11px] font-sans">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Nation-State
                  </span>
                  <span className="font-mono text-slate-400">24 (27.0%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> Cybercriminal
                  </span>
                  <span className="font-mono text-slate-400">31 (34.8%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Script-Kiddie
                  </span>
                  <span className="font-mono text-slate-400">18 (20.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Researcher
                  </span>
                  <span className="font-mono text-slate-400">10 (11.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#64748B]" /> Unknown
                  </span>
                  <span className="font-mono text-slate-400">6 (6.7%)</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/alerts"
            className="mt-4 block text-center py-2 rounded-lg bg-[#0C1322] hover:bg-[#141E33] border border-[#172338] text-xs font-semibold text-slate-300 transition-colors"
          >
            View All Profiles
          </Link>
        </div>
      </div>

      {/* Row 3: 3 Column Panels (Recent High-Risk Events | Attack Campaigns | System Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent High-Risk Events (5 of 12 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Recent High-Risk Events</h3>
              <Link href="/events" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300">
                View All Events
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-sans">
                <thead className="text-[10px] uppercase font-mono text-slate-500 border-b border-[#172338] pb-1">
                  <tr>
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Source (Anon)</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Severity</th>
                    <th className="pb-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131D2E] text-slate-300">
                  <tr>
                    <td className="py-2 text-slate-500 whitespace-nowrap">2 min ago</td>
                    <td className="py-2 text-rose-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> SSH Brute Force
                    </td>
                    <td className="py-2 font-mono text-slate-400">3f9a...c2b1</td>
                    <td className="py-2">🇺🇸 United States</td>
                    <td className="py-2 font-bold text-rose-400">HIGH</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">Failed login attempt (23)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 whitespace-nowrap">7 min ago</td>
                    <td className="py-2 text-rose-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Lure Document Opened
                    </td>
                    <td className="py-2 font-mono text-slate-400">a7b1...9d3e</td>
                    <td className="py-2">🇩🇪 Germany</td>
                    <td className="py-2 font-bold text-rose-400">HIGH</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">invoice_Q4_2024.pdf</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 whitespace-nowrap">11 min ago</td>
                    <td className="py-2 text-rose-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> MCP Tool Invoked
                    </td>
                    <td className="py-2 font-mono text-slate-400">9c2e...7f11</td>
                    <td className="py-2">🇸🇬 Singapore</td>
                    <td className="py-2 font-bold text-rose-400">HIGH</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">database_query_tool</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 whitespace-nowrap">15 min ago</td>
                    <td className="py-2 text-amber-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Beacon Callback
                    </td>
                    <td className="py-2 font-mono text-slate-400">1a2b...4c5d</td>
                    <td className="py-2">🇳🇱 Netherlands</td>
                    <td className="py-2 font-bold text-amber-400">MEDIUM</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">env_config.json</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 whitespace-nowrap">23 min ago</td>
                    <td className="py-2 text-amber-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Port Scan Detected
                    </td>
                    <td className="py-2 font-mono text-slate-400">7e6d...8a9b</td>
                    <td className="py-2">🇷🇺 Russia</td>
                    <td className="py-2 font-bold text-amber-400">MEDIUM</td>
                    <td className="py-2 text-slate-400 truncate max-w-[120px]">22,80,443,8080</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-[#172338] flex items-center gap-3 text-[10px] font-sans text-slate-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> HIGH</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> MEDIUM</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LOW</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> INFO</span>
          </div>
        </div>

        {/* Attack Campaigns (4 of 12 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Attack Campaigns</h3>
              <Link href="/events" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#070B14] border border-[#172338] text-center mb-4">
              <div>
                <span className="text-[10px] text-slate-400 block">Active Campaigns</span>
                <span className="text-base font-bold font-mono text-white">7 <span className="text-[10px] text-emerald-400">↑ 16.7%</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Campaigns</span>
                <span className="text-base font-bold font-mono text-white">23</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Avg Dwell Time</span>
                <span className="text-base font-bold font-mono text-slate-200">2h 34m</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">
                Campaign Stage Distribution
              </span>

              {/* Bar Chart Visual for Campaign Stages */}
              <div className="h-32 flex items-end gap-3 pt-4 px-2">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">42%</span>
                  <div className="w-full bg-blue-500 rounded-t-md h-20" />
                  <span className="text-[10px] text-slate-400">Recon</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">28%</span>
                  <div className="w-full bg-rose-500 rounded-t-md h-14" />
                  <span className="text-[10px] text-slate-400">Exploit</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">17%</span>
                  <div className="w-full bg-amber-500 rounded-t-md h-9" />
                  <span className="text-[10px] text-slate-400">Lateral Move</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">13%</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-6" />
                  <span className="text-[10px] text-slate-400">Exfiltrate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health (3 of 12 cols) */}
        <div className="lg:col-span-3 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">System Health</h3>

            <div className="space-y-2.5 text-xs font-sans">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> SSH Honeypot
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Online</span>
                <span className="text-slate-500 font-mono text-[10px]">2222</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> Beacon Receiver
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Online</span>
                <span className="text-slate-500 font-mono text-[10px]">8001</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> Database
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Healthy</span>
                <span className="text-slate-500 font-mono text-[10px]">PostgreSQL</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> AI Engine (OpenCode)
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Connected</span>
                <span className="text-slate-500 font-mono text-[10px]">zen/v1</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> Audit Ledger
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Verified</span>
                <span className="text-slate-500 font-mono text-[10px]">Block #4582</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#070B14] border border-[#172338]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-400" /> SMTP Server
                </span>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">Connected</span>
                <span className="text-slate-500 font-mono text-[10px]">smtp.gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: 3 Column Panels (Compliance Score | Threat Intel Exports | Ghost Bounty Program) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Compliance Score (4 of 12 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Compliance Score</h3>
              <Link href="/settings" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300">
                View Compliance
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center my-2">
              {/* Circular Gauge */}
              <div className="col-span-5 relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#121D33" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="8" strokeDasharray="231 251" fill="none" strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-bold font-mono text-white block">92%</span>
                  <span className="text-[9px] text-slate-400 uppercase">Overall</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="col-span-7 space-y-3 text-xs font-sans">
                <div>
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span>SOC 2 Type II</span>
                    <span className="font-mono font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="w-full bg-[#121D33] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span>ISO 27001:2022</span>
                    <span className="font-mono font-bold text-emerald-400">90%</span>
                  </div>
                  <div className="w-full bg-[#121D33] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[90%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Intel Exports (4 of 12 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Threat Intel Exports</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#070B14] border border-[#172338] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <RiFileShield2Line className="w-4 h-4" /> STIX 2.1 Bundles
                </div>
                <div className="text-lg font-bold font-mono text-white">12</div>
                <div className="text-[10px] text-slate-500">Last 24h</div>
              </div>

              <div className="p-3 rounded-xl bg-[#070B14] border border-[#172338] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <RiShieldCheckLine className="w-4 h-4" /> Sigma Rules
                </div>
                <div className="text-lg font-bold font-mono text-white">8</div>
                <div className="text-[10px] text-slate-500">Last 24h</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Threat Intelligence Export: Generating STIX 2.1 & Sigma bundle...')}
            className="w-full py-2 rounded-lg bg-[#0C1322] hover:bg-[#141E33] border border-[#172338] text-xs font-semibold text-slate-300 transition-colors"
          >
            Export Now
          </button>
        </div>

        {/* Ghost Bounty Program (4 of 12 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#0B111E] border border-[#172338] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Ghost Bounty Program</h3>

            <div className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#070B14] border border-[#172338] mb-4">
              <div className="col-span-7 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <RiShieldKeyholeLine className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Bounties Paid</span>
                  <div className="text-sm font-bold font-mono text-white">
                    Ξ 2.45 <span className="text-[10px] text-slate-400 font-normal">(~$4,826)</span>
                  </div>
                </div>
              </div>

              <div className="col-span-5 text-right border-l border-[#172338] pl-2">
                <span className="text-[10px] text-slate-400 block">Pending Claims</span>
                <span className="text-sm font-bold font-mono text-purple-400">3 Researchers</span>
              </div>
            </div>
          </div>

          <Link
            href="/bounties"
            className="block text-center py-2 rounded-lg bg-[#0C1322] hover:bg-[#141E33] border border-[#172338] text-xs font-semibold text-slate-300 transition-colors"
          >
            View Bounties
          </Link>
        </div>
      </div>
    </div>
  );
}
