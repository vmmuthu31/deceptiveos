'use client';

import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { PrivateTreasuryState } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import {
  RiCoinsLine,
  RiExchangeLine,
  RiLock2Line,
  RiSafe2Line,
  RiShieldCheckLine,
  RiWallet3Line
} from 'react-icons/ri';

export default function TreasuryPage() {
  const [treasury, setTreasury] = useState<PrivateTreasuryState | null>(null);
  const [actionType, setActionType] = useState<'SHIELD' | 'UNSHIELD'>('SHIELD');
  const [amountStrk, setAmountStrk] = useState(500);
  const [executing, setExecuting] = useState(false);

  async function loadTreasury() {
    try {
      const res = await fetch('/api/treasury');
      if (res.ok) {
        const data = await res.json() as { treasury: PrivateTreasuryState };
        setTreasury(data.treasury);
      }
    } catch {

    }
  }

  useEffect(() => {
    loadTreasury();
  }, []);

  async function handleExecuteTx(e: React.FormEvent) {
    e.preventDefault();
    setExecuting(true);
    try {
      const memo = actionType === 'SHIELD' ? 'Shield public STRK into STRK20 Privacy Pool' : 'Unshield STRK20 private balance to public wallet';
      const res = await fetch('/api/treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actionType, amountStrk, memo }),
      });
      if (res.ok) {
        const data = await res.json() as { treasury: PrivateTreasuryState };
        setTreasury(data.treasury);
      }
    } catch {

    } finally {
      setExecuting(false);
    }
  }

  if (!treasury) {
    return <div className="p-8 text-center text-slate-500 font-mono text-sm">Loading Private Treasury State...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      {}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <RiSafe2Line className="w-3.5 h-3.5" />
              <span>STRK20 Privacy Pool Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Private Treasury
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Manage your STRK20 private balance lifecycle: Shield funds, execute private threat bounty transfers, and unshield tokens on Starknet mainnet.
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Public Wallet Balance</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{treasury.publicBalanceStrk.toLocaleString()} STRK</h2>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">0x0471...938d</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <RiWallet3Line className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-indigo-900 text-white border-indigo-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-indigo-200">Shielded Balance</span>
              <h2 className="text-2xl font-bold text-white mt-1">{treasury.shieldedBalanceStrk.toLocaleString()} STRK</h2>
              <p className="text-[11px] text-indigo-300 mt-1 font-mono">STRK20 Zero-Knowledge Pool</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-800 text-indigo-300 flex items-center justify-center border border-indigo-700">
              <RiLock2Line className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Committed Bounties</span>
              <h2 className="text-2xl font-bold text-indigo-600 mt-1">{treasury.committedBountyStrk.toLocaleString()} STRK</h2>
              <p className="text-[11px] text-slate-400 mt-1">Available: {treasury.availableShieldedStrk.toLocaleString()} STRK</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <RiCoinsLine className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Execute STRK20 Operation</CardTitle>
            <CardDescription>Shield public STRK into private pool or unshield back to wallet</CardDescription>
          </CardHeader>

          <form onSubmit={handleExecuteTx} className="space-y-4 mt-2 text-xs">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActionType('SHIELD')}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  actionType === 'SHIELD' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shield STRK (TX 1)
              </button>
              <button
                type="button"
                onClick={() => setActionType('UNSHIELD')}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  actionType === 'UNSHIELD' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unshield STRK (TX 3)
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (STRK)</label>
              <input
                type="number"
                value={amountStrk}
                onChange={(e) => setAmountStrk(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-mono font-semibold">STRK20 Privacy Pool</span>
              </div>
              <div className="flex justify-between">
                <span>Privacy Mode:</span>
                <span className="font-mono text-indigo-600 font-semibold">Zero-Knowledge UTXO</span>
              </div>
            </div>

            <Button type="submit" disabled={executing} variant="primary" className="w-full rounded-xl font-semibold">
              <RiExchangeLine className="w-4 h-4" />
              <span>{executing ? 'Processing Transaction...' : `${actionType} ${amountStrk} STRK`}</span>
            </Button>
          </form>
        </Card>

        {}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Recent Private STRK20 Operations</CardTitle>
            <CardDescription>Tamper-evident transaction ledger on Starknet</CardDescription>
          </CardHeader>

          <div className="space-y-3 mt-2">
            {treasury.transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    tx.type === 'SHIELD' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    tx.type === 'PRIVATE_TRANSFER' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    <RiShieldCheckLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{tx.memo}</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">UTXO: {tx.utxoCommitment}</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`font-bold text-sm ${
                    tx.type === 'SHIELD' ? 'text-emerald-600' : tx.type === 'UNSHIELD' ? 'text-amber-600' : 'text-indigo-600'
                  }`}>
                    {tx.type === 'SHIELD' ? '+' : '-'}{tx.amountStrk} STRK
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
