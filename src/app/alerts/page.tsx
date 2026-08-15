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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <RiAlertLine className="w-6 h-6 text-rose-400" />
          Attacker DNA & Behavioral Fingerprints
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated classification (ScriptKiddie, HumanOperator, AIAgent) and MITRE ATT&CK matrix mapping based on session timing, tools, and command velocity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glow-rose border border-rose-900/40">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-400">Autonomous AI Agents</span>
              <RiBrainLine className="w-5 h-5 text-rose-400" />
            </div>
            <CardTitle className="text-2xl font-mono text-rose-400">1 Detected</CardTitle>
            <CardDescription>High velocity, zero typo, rapid sub-second execution</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-amber-900/40">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-400">Human Operators</span>
              <RiFingerprintLine className="w-5 h-5 text-amber-400" />
            </div>
            <CardTitle className="text-2xl font-mono text-amber-400">1 Detected</CardTitle>
            <CardDescription>Interactive pauses, organic command variations</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-cyan-900/40">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-slate-400">MITRE ATT&CK Mapped</span>
              <RiCompass3Line className="w-5 h-5 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl font-mono text-cyan-400">5 Techniques</CardTitle>
            <CardDescription>T1059, T1082, T1005, T1105, T1068</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <RiFingerprintLine className="w-4 h-4 text-emerald-400" /> Active Attacker Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profiles.map((prof) => (
            <AttackerProfileCard key={prof.id} profile={prof} />
          ))}
        </div>
      </div>
    </div>
  );
}
