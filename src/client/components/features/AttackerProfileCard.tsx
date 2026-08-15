'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { AttackerProfile } from '@/shared/types';
import React from 'react';
import { RiAlarmWarningLine, RiBrainLine, RiCompass3Line, RiFingerprintLine } from 'react-icons/ri';

interface AttackerProfileCardProps {
  profile: AttackerProfile;
}

export const AttackerProfileCard: React.FC<AttackerProfileCardProps> = ({ profile }) => {
  const getClassificationBadge = () => {
    switch (profile.classification) {
      case 'AIAgent':
        return <Badge variant="danger"><RiBrainLine className="w-3.5 h-3.5" /> Autonomous AI Agent</Badge>;
      case 'HumanOperator':
        return <Badge variant="warning">Human Operator</Badge>;
      default:
        return <Badge variant="info">Script Kiddie</Badge>;
    }
  };

  return (
    <Card className="border border-slate-800/80">
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <RiFingerprintLine className="w-5 h-5 text-cyan-400" />
            <CardTitle className="font-mono text-base">{profile.ip}</CardTitle>
          </div>
          <CardDescription>
            First seen: <span className="font-mono text-slate-300">{new Date(profile.firstSeenAt).toLocaleDateString()}</span> | Total Sessions: <span className="font-mono text-slate-200">{profile.totalSessions}</span>
          </CardDescription>
        </div>
        {getClassificationBadge()}
      </CardHeader>

      <div className="space-y-3 my-3">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Command Velocity</span>
            <span className="text-emerald-400 font-semibold">{profile.behavioralDNA.commandVelocityPerMin} / min</span>
          </div>
          <div>
            <span className="text-slate-500 block">Bot Probability</span>
            <span className="text-rose-400 font-semibold">{Math.round(profile.behavioralDNA.botProbability * 100)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tool Signature</span>
            <span className="text-slate-200 truncate block">{profile.behavioralDNA.toolSignature}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Timezone Est.</span>
            <span className="text-cyan-400 font-semibold">{profile.behavioralDNA.timezoneEstimate}</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <RiCompass3Line className="w-3.5 h-3.5 text-cyan-400" /> MITRE ATT&CK Techniques:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.mitreTechniques.map((tech) => (
              <span key={tech} className="px-2 py-0.5 rounded bg-slate-900 text-[11px] font-mono text-cyan-300 border border-cyan-900/60">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Confidence Score: <strong className="text-emerald-400">{Math.round(profile.confidence * 100)}%</strong></span>
        <span className="flex items-center gap-1 text-rose-400 font-semibold">
          <RiAlarmWarningLine className="w-4 h-4" /> {profile.threatLevel} Threat
        </span>
      </div>
    </Card>
  );
};
