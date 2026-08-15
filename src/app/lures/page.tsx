'use client';

import { LureGeneratorForm } from '@/client/components/features/LureGeneratorForm';
import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { BeaconEvent, LureDocument } from '@/shared/types';
import { formatTimestamp } from '@/shared/utils/formatters';
import React, { useEffect, useState } from 'react';
import { RiDownloadLine, RiFileShield2Line, RiGlobalLine, RiRadarLine, RiTimeLine } from 'react-icons/ri';

export default function LuresPage() {
  const [lures, setLures] = useState<LureDocument[]>([]);
  const [beacons, setBeacons] = useState<BeaconEvent[]>([]);
  const [generatedDocPreview, setGeneratedDocPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const lureRes = await fetch('/api/lures');
        if (lureRes.ok) {
          const lureData = await lureRes.json() as { lures: LureDocument[] };
          setLures(lureData.lures || []);
        }

        const beaconRes = await fetch('/api/lures/beacon');
        if (beaconRes.ok) {
          const beaconData = await beaconRes.json() as { beacons: BeaconEvent[] };
          setBeacons(beaconData.beacons || []);
        }
      } catch {
        // fallback
      }
    }
    loadData();
  }, []);

  const handleLureGenerated = (lure: LureDocument, content: string) => {
    setLures((prev) => [lure, ...prev]);
    setGeneratedDocPreview(content);
  };

  const handleSimulateBeaconHit = async (token: string) => {
    try {
      const res = await fetch('/api/lures/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watermarkToken: token, sourceIp: '185.220.101.99', userAgent: 'Simulated Attacker Tool' }),
      });
      if (res.ok) {
        const data = await res.json() as { beacon: BeaconEvent };
        setBeacons((prev) => [data.beacon, ...prev]);
        setLures((prev) =>
          prev.map((l) => (l.watermark.token === token ? { ...l, beaconHitsCount: l.beaconHitsCount + 1 } : l))
        );
      }
    } catch {
      // fallback
    }
  };

  const handleDownloadLure = (id: string, title: string) => {
    const a = document.createElement('a');
    a.href = `/api/lures/download/${id}`;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <RiFileShield2Line className="w-6 h-6 text-emerald-400" />
          Semantic Lure Studio & Steganographic Watermarks
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Synthesize authentic confidential lure documents embedded with invisible watermark signatures that ping home if exfiltrated.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <LureGeneratorForm onLureGenerated={handleLureGenerated} />

          {generatedDocPreview && (
            <Card className="border border-emerald-800/60 glow-emerald">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-sm font-mono text-emerald-400">Generated Watermarked Output Preview</CardTitle>
                  <Badge variant="success">Watermark Embedded</Badge>
                </div>
              </CardHeader>
              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto border border-slate-900 whitespace-pre-wrap">
                {generatedDocPreview}
              </pre>
            </Card>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <RiFileShield2Line className="w-4 h-4 text-emerald-400" /> Active Watermarked Lures
            </h2>
            {lures.map((lure) => (
              <Card key={lure.id} className="border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold font-mono text-slate-100">{lure.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type: <span className="font-mono text-slate-200">{lure.docType}</span> | Context:{' '}
                      <span className="text-cyan-400">{lure.targetCompany}</span> ({lure.industry})
                    </p>
                  </div>
                  <Badge variant={lure.beaconHitsCount > 0 ? 'warning' : 'outline'}>
                    {lure.beaconHitsCount} Beacon Hits
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Token: <strong className="text-emerald-400">{lure.watermark.token}</strong></span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadLure(lure.id, lure.title)}>
                      <RiDownloadLine className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSimulateBeaconHit(lure.watermark.token)}>
                      <RiRadarLine className="w-3.5 h-3.5" />
                      <span>Test Beacon</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-20 border border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiRadarLine className="w-5 h-5 text-rose-400 animate-pulse" />
                <CardTitle>Steganographic Beacon Callback Stream</CardTitle>
              </div>
              <CardDescription>Live log of watermarked documents opened on external host networks</CardDescription>
            </CardHeader>

            <div className="space-y-3">
              {beacons.map((beacon) => (
                <div key={beacon.id} className="p-3 rounded-lg bg-slate-950 border border-rose-900/40 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-semibold">
                    <span className="truncate">{beacon.documentTitle}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <RiTimeLine className="w-3 h-3" /> {formatTimestamp(beacon.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <RiGlobalLine className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{beacon.sourceIp}</span>
                    <span className="text-slate-500">({beacon.location})</span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    User-Agent: {beacon.userAgent}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
