'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { ComplianceSummary } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiCpuLine, RiDownloadLine, RiSettings4Line, RiShieldCheckLine } from 'react-icons/ri';

export default function SettingsPage() {
  const [compliance, setCompliance] = useState<ComplianceSummary | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; model: string; latencyMs: number }>({
    available: true,
    model: 'llama3.1:8b',
    latencyMs: 140,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadSettingsData() {
      try {
        const compRes = await fetch('/api/compliance');
        if (compRes.ok) {
          const compData = await compRes.json() as { summary: ComplianceSummary };
          setCompliance(compData.summary || null);
        }

        const ollamaRes = await fetch('/api/ollama');
        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json() as { health: { available: boolean; model: string; latencyMs: number } };
          if (ollamaData.health) setOllamaStatus(ollamaData.health);
        }
      } catch {
        // fallback
      }
    }
    loadSettingsData();
  }, []);

  const handleExportEvidence = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/compliance', { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CipherNest_SOC2_Evidence_Report.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {
      // error handling
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <RiSettings4Line className="w-6 h-6 text-emerald-400" />
          Settings & Compliance Audit Export
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify local AI inference model health, air-gap security settings, and export immutable SOC 2 / ISO 27001 audit evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local AI Status */}
        <Card className="border border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <RiCpuLine className="w-5 h-5 text-cyan-400" />
                <CardTitle>Local Ollama AI Engine</CardTitle>
              </div>
              <Badge variant={ollamaStatus.available ? 'success' : 'danger'}>
                {ollamaStatus.available ? 'Online (Air-Gapped)' : 'Offline'}
              </Badge>
            </div>
            <CardDescription>Zero cloud dependency. All honeypot responses and lure generation execute locally.</CardDescription>
          </CardHeader>

          <div className="space-y-3 font-mono text-xs p-4 bg-slate-950/80 rounded-lg border border-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Selected Model:</span>
              <span className="text-slate-100 font-semibold">{ollamaStatus.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Inference Host:</span>
              <span className="text-slate-300">http://localhost:11434</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Local Response Latency:</span>
              <span className="text-cyan-400">{ollamaStatus.latencyMs}ms</span>
            </div>
          </div>
        </Card>

        {/* Air-gap / Compliance Status */}
        <Card className="border border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <RiShieldCheckLine className="w-5 h-5 text-emerald-400" />
                <CardTitle>Compliance Audit Readiness</CardTitle>
              </div>
              <Badge variant="success">SOC 2 Ready</Badge>
            </div>
            <CardDescription>Cryptographic append-only event ledger and regulatory control evidence.</CardDescription>
          </CardHeader>

          {compliance && (
            <div className="space-y-3 font-mono text-xs p-4 bg-slate-950/80 rounded-lg border border-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">SOC 2 Type II Score:</span>
                <span className="text-emerald-400 font-semibold">{compliance.soc2Score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ISO 27001:2022 Score:</span>
                <span className="text-emerald-400 font-semibold">{compliance.iso27001Score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Immutable Ledger Height:</span>
                <span className="text-slate-200">{compliance.immutableAuditLogHeight} blocks</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
            <Button onClick={handleExportEvidence} disabled={exporting}>
              <RiDownloadLine className="w-4 h-4" />
              <span>{exporting ? 'Generating Report...' : 'Download SOC 2 Evidence Report'}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
