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
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <RiFileShield2Line className="w-5 h-5" />
          </div>
          Semantic Lure Studio & Steganographic Watermarks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Synthesize authentic lure documents embedded with steganographic canary tokens that alert upon exfiltration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <LureGeneratorForm onLureGenerated={handleLureGenerated} />

          {generatedDocPreview && (
            <Card className="border-indigo-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-xs font-mono text-indigo-600 font-bold">Generated Watermarked Document Output</CardTitle>
                  <Badge variant="success" dot>WATERMARK EMBEDDED</Badge>
                </div>
              </CardHeader>
              <pre className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                {generatedDocPreview}
              </pre>
            </Card>
          )}

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-2">
              <RiFileShield2Line className="w-4 h-4 text-indigo-600" /> Deployed Watermarked Lure Index
            </h2>
            {lures.map((lure) => (
              <Card key={lure.id} className="hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-900">{lure.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Format: <span className="font-mono text-slate-800 font-semibold">{lure.docType}</span> | Context:{' '}
                      <span className="text-indigo-600 font-bold">{lure.targetCompany}</span> ({lure.industry})
                    </p>
                  </div>
                  <Badge variant={lure.beaconHitsCount > 0 ? 'warning' : 'outline'} dot>
                    {lure.beaconHitsCount} BEACON CALLBACKS
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Token: <strong className="text-indigo-600 font-bold">{lure.watermark.token}</strong></span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleDownloadLure(lure.id, lure.title)} className="rounded-xl font-semibold">
                      <RiDownloadLine className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSimulateBeaconHit(lure.watermark.token)} className="rounded-xl font-semibold">
                      <RiRadarLine className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Test Callback</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RiRadarLine className="w-4 h-4 animate-pulse" />
                </div>
                <CardTitle className="font-bold text-slate-900">Steganographic Callback Stream</CardTitle>
              </div>
              <CardDescription>Real-time telemetry when watermarked documents are opened on external networks</CardDescription>
            </CardHeader>

            <div className="space-y-2.5">
              {beacons.map((beacon) => (
                <div key={beacon.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono text-xs shadow-xs">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span className="truncate">{beacon.documentTitle}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <RiTimeLine className="w-3 h-3" /> {formatTimestamp(beacon.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                    <RiGlobalLine className="w-3.5 h-3.5" />
                    <span>{beacon.sourceIp}</span>
                    <span className="text-slate-500 font-normal">({beacon.location})</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
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


