'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { AttackCampaign } from '@/shared/types';
import {
  RiArrowRightLine,
  RiFileShield2Line,
  RiNodeTree,
  RiRefreshLine,
  RiRobot2Line,
  RiShieldCheckLine,
  RiShieldCrossLine,
  RiSkull2Line,
  RiTerminalBoxLine,
} from 'react-icons/ri';

export const AttackGraphVisualizer: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AttackCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/attack-graph');
      if (res.ok) {
        const data = (await res.json()) as { campaigns: AttackCampaign[] };
        setCampaigns(data.campaigns || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const currentCampaign = campaigns[activeCampaignIndex];

  return (
    <Card className="border border-slate-200/80 shadow-xs font-sans overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RiNodeTree className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Multi-Stage Attack Graph & Kill-Chain Correlation
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Correlating isolated honeypot sessions, prompt injection tool calls, and honeytoken exfiltration into unified attack graphs.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5 transition-colors"
            >
              <RiRefreshLine className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Graph
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {loading && campaigns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">
            Synthesizing attack graph telemetry...
          </div>
        ) : !currentCampaign ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No active multi-stage attack campaigns detected.
          </div>
        ) : (
          <div className="space-y-6">
            {campaigns.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {campaigns.map((camp, idx) => (
                  <button
                    key={camp.id}
                    onClick={() => setActiveCampaignIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      idx === activeCampaignIndex
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Campaign #{idx + 1} ({camp.attackerIp})
                  </button>
                ))}
              </div>
            )}
            {/* Campaign Selector & Risk Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-xs font-semibold">
                    {currentCampaign.classification}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {currentCampaign.attackerDna} ({currentCampaign.attackerIp})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  First Seen: {new Date(currentCampaign.firstSeenAt).toLocaleTimeString()} • Status: <span className="text-emerald-400 font-semibold">{currentCampaign.status}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Composite Risk Score</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">
                    {currentCampaign.overallRiskScore} / 100
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <RiSkull2Line className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Kill Chain Progression Stages */}
            <div>
              <div className="text-xs font-bold text-slate-600 uppercase font-mono tracking-wider mb-3">
                Kill-Chain Stage Progression
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { stage: 'Reconnaissance', icon: RiTerminalBoxLine },
                  { stage: 'Initial Access', icon: RiShieldCrossLine },
                  { stage: 'Tool Abuse', icon: RiRobot2Line },
                  { stage: 'Exfiltration', icon: RiFileShield2Line },
                ].map((item) => {
                  const completed = currentCampaign.stagesCompleted.includes(item.stage);
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.stage}
                      className={`p-3 rounded-lg border flex items-center gap-2.5 ${
                        completed
                          ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${completed ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{item.stage}</div>
                        <div className="text-[10px] font-mono">
                          {completed ? 'Trapped & Logged' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Graph Node-Link Flow */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase font-mono">
                  Deception Diversion Flow
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-medium">
                  <RiShieldCheckLine className="w-3.5 h-3.5" />
                  Real Database Protected (100% Diverted)
                </span>
              </div>

              <div className="space-y-3">
                {currentCampaign.links.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-100">
                        Attacker
                      </span>
                      <RiArrowRightLine className="w-3.5 h-3.5 text-slate-400" />
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 flex items-center gap-1">
                        🍯 {link.target.replace('node-', '')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-medium">{link.action}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                        {link.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
