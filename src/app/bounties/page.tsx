'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { GhostBountyItem } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import {
  RiAddLine,
  RiCheckDoubleLine,
  RiCoinsLine,
  RiFingerprintLine,
  RiInformationLine,
  RiLock2Line,
  RiRefreshLine,
  RiShieldKeyholeLine
} from 'react-icons/ri';

export default function GhostBountiesPage() {
  const [bounties, setBounties] = useState<GhostBountyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingModal, setFundingModal] = useState(false);
  const [claimModal, setClaimModal] = useState<GhostBountyItem | null>(null);

  const [title, setTitle] = useState('');
  const [dnaFingerprint, setDnaFingerprint] = useState('DNA: 9C-F4-11');
  const [description, setDescription] = useState('');
  const [rewardStrk, setRewardStrk] = useState(150);

  const [intelReport, setIntelReport] = useState('');

  async function loadBounties() {
    setLoading(true);
    try {
      const res = await fetch('/api/bounties');
      if (res.ok) {
        const data = await res.json() as { bounties: GhostBountyItem[] };
        setBounties(data.bounties || []);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBounties();
  }, []);

  async function handleFundBounty(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dnaFingerprint, description, rewardStrk }),
      });
      if (res.ok) {
        const data = await res.json() as { bounty: GhostBountyItem };
        setBounties((prev) => [data.bounty, ...prev]);
        setFundingModal(false);
        setTitle('');
        setDescription('');
      }
    } catch {
      // error
    }
  }

  async function handleClaimBounty(e: React.FormEvent) {
    e.preventDefault();
    if (!claimModal) return;
    try {
      const res = await fetch('/api/bounties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId: claimModal.id, intelligenceReport: intelReport }),
      });
      if (res.ok) {
        const data = await res.json() as { bounty: GhostBountyItem };
        setBounties((prev) => prev.map((b) => (b.id === data.bounty.id ? data.bounty : b)));
        setClaimModal(null);
        setIntelReport('');
      }
    } catch {
      // error
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <RiShieldKeyholeLine className="w-3.5 h-3.5" />
              <span>STRK20 Shielded Coordination</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              GhostBounties
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Fund threat intelligence requests privately using STRK20 shielded balances. Neither your organization identity nor wallet address is publicly exposed on-chain.
            </p>
          </div>

          <Button onClick={() => setFundingModal(true)} variant="primary" className="rounded-xl font-semibold self-start md:self-auto shadow-xs">
            <RiAddLine className="w-4 h-4" />
            <span>Fund GhostBounty</span>
          </Button>
        </div>
      </div>

      {/* Grid of Active GhostBounties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bounties.map((bounty) => (
          <Card key={bounty.id} className="hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                    {bounty.dnaFingerprint}
                  </span>
                  <Badge variant={bounty.shieldedStatus === 'CLAIMED' ? 'success' : 'indigo'}>
                    <RiLock2Line className="w-3 h-3" />
                    <span>{bounty.shieldedStatus}</span>
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">{bounty.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">{bounty.description}</CardDescription>
              </CardHeader>

              <div className="p-5 pt-0 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {bounty.mitreTtps.map((ttp) => (
                    <span key={ttp} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {ttp}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 font-sans">Shielded Reward:</span>
                  <span className="font-bold text-indigo-600 text-sm flex items-center gap-1">
                    <RiCoinsLine className="w-4 h-4" />
                    {bounty.rewardStrk} STRK
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                Tx: {bounty.fundedTxHash ? bounty.fundedTxHash.substring(0, 14) + '...' : '0x...'}
              </span>
              {bounty.shieldedStatus !== 'CLAIMED' ? (
                <Button size="sm" variant="outline" onClick={() => setClaimModal(bounty)} className="rounded-lg text-xs font-medium">
                  Submit Private Intel
                </Button>
              ) : (
                <span className="text-emerald-600 font-bold font-mono text-[11px] flex items-center gap-1">
                  <RiCheckDoubleLine className="w-4 h-4" /> Claimed Anonymously
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Fund Bounty Modal */}
      {fundingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Private GhostBounty</h3>
            <p className="text-xs text-slate-500">Fund an intelligence request using STRK20 shielded tokens without exposing your organization identity.</p>

            <form onSubmit={handleFundBounty} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Attacker DNA Fingerprint</label>
                <input
                  type="text"
                  value={dnaFingerprint}
                  onChange={(e) => setDnaFingerprint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bounty Title</label>
                <input
                  type="text"
                  value={title}
                  placeholder="e.g. Unmask C2 IPs for Botnet Campaign"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Intel Requirements</label>
                <textarea
                  value={description}
                  rows={3}
                  placeholder="Describe the required intelligence details..."
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shielded STRK Reward</label>
                <input
                  type="number"
                  value={rewardStrk}
                  onChange={(e) => setRewardStrk(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setFundingModal(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" variant="primary" className="rounded-xl">Fund & Shield STRK</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Bounty Modal */}
      {claimModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Submit Private Threat Intelligence</h3>
            <p className="text-xs text-slate-500">Claim {claimModal.rewardStrk} STRK anonymously. Your submission will be verified against matching DNA signatures.</p>

            <form onSubmit={handleClaimBounty} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intelligence Evidence & Attribution Data</label>
                <textarea
                  value={intelReport}
                  rows={4}
                  placeholder="Paste matched C2 IP addresses, attack timestamps, or payload signatures..."
                  onChange={(e) => setIntelReport(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setClaimModal(null)} className="rounded-xl">Cancel</Button>
                <Button type="submit" variant="primary" className="rounded-xl">Submit & Claim Reward</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
