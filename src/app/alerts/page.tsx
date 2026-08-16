'use client';

import { AttackerProfileCard } from '@/client/components/features/AttackerProfileCard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { AttackerProfile } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import { RiAlertLine, RiBrainLine, RiCompass3Line, RiFingerprintLine } from 'react-icons/ri';

export default function AlertsPage() {
  const [profiles, setProfiles] = useState<AttackerProfile[]>([]);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json() as { profiles: AttackerProfile[] };
          setProfiles(data.profiles || []);
        }
      } catch {
        // fallback
      }
    }
    loadProfiles();
  }, []);

  const aiCount = profiles.filter((p) => p.classification === 'AIAgent').length;
  const humanCount = profiles.filter((p) => p.classification === 'HumanOperator').length;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <RiAlertLine className="w-5 h-5 text-indigo-400" />
          Attacker DNA & Behavioral Classification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Fingerprinting attacker identity (ScriptKiddie, HumanOperator, AIAgent) and MITRE ATT&CK technique mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-2 border-t-red-500">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Autonomous AI Agents</span>
              <RiBrainLine className="w-4 h-4 text-red-400" />
            </div>
            <CardTitle className="text-xl font-mono text-slate-100 mt-1">{aiCount} Detected</CardTitle>
            <CardDescription>Sub-second execution velocity, automated toolchains</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-t-2 border-t-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Human Operators</span>
              <RiFingerprintLine className="w-4 h-4 text-amber-400" />
            </div>
            <CardTitle className="text-xl font-mono text-slate-100 mt-1">{humanCount} Detected</CardTitle>
            <CardDescription>Organic typing jitter, interactive shell reconnaissance</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-t-2 border-t-indigo-500">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">MITRE ATT&CK Coverage</span>
              <RiCompass3Line className="w-4 h-4 text-indigo-400" />
            </div>
            <CardTitle className="text-xl font-mono text-slate-100 mt-1">5 Techniques</CardTitle>
            <CardDescription>T1059.004, T1082, T1005, T1105, T1068</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <RiFingerprintLine className="w-4 h-4 text-indigo-400" /> Active Attacker Profile Index
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((prof) => (
            <AttackerProfileCard key={prof.id} profile={prof} />
          ))}
        </div>
      </div>
    </div>
  );
}

