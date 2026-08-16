'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { AnonymizedThreatNode } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import {
  RiNodeTree,
  RiTerminalBoxLine
} from 'react-icons/ri';

export default function ThreatNetworkPage() {
  const [nodes, setNodes] = useState<AnonymizedThreatNode[]>([]);

  async function loadNetwork() {
    try {
      const res = await fetch('/api/network');
      if (res.ok) {
        const data = await res.json() as { nodes: AnonymizedThreatNode[] };
        setNodes(data.nodes || []);
      }
    } catch {
      // error
    }
  }

  useEffect(() => {
    loadNetwork();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <RiNodeTree className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Threat Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Private Attacker Graph
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Share anonymized threat fingerprints (`DNA: 7F-A2-91`) across participating defenders without exposing who was attacked, organization names, or infrastructure IPs.
          </p>
        </div>
      </div>

      {/* Grid of Anonymized Threat Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <Card key={node.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200/60">
                  {node.anonymousDna}
                </span>
                <Badge variant={node.threatLevel === 'Critical' ? 'danger' : 'warning'}>
                  {node.threatLevel}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-3 flex items-center gap-1.5">
                <RiTerminalBoxLine className="w-4 h-4 text-slate-500" />
                {node.toolSignature}
              </CardTitle>
            </CardHeader>

            <div className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex flex-wrap gap-1">
                {node.mitreTechniques.map((tech) => (
                  <span key={tech} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-600 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Contributing Defenders:</span>
                  <span className="font-bold text-slate-900">{node.contributingDefendersCount} Organizations</span>
                </div>
                <div className="flex justify-between">
                  <span>Bot Probability:</span>
                  <span className="font-bold text-indigo-600">{(node.botProbability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
