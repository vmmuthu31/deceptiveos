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
        return <Badge variant="critical" dot><RiBrainLine className="w-3 h-3" /> AUTONOMOUS AI AGENT</Badge>;
      case 'HumanOperator':
        return <Badge variant="high" dot>HUMAN OPERATOR</Badge>;
      default:
        return <Badge variant="medium" dot>SCRIPT KIDDIE</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between font-sans h-full">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <RiFingerprintLine className="w-4 h-4 text-indigo-400" />
              <CardTitle className="font-mono text-base text-slate-100">{profile.ip}</CardTitle>
            </div>
            {getClassificationBadge()}
          </div>
          <CardDescription>
            First seen: <span className="font-mono text-slate-300">{new Date(profile.firstSeenAt).toLocaleDateString()}</span> | Total Sessions: <span className="font-mono text-slate-200 font-semibold">{profile.totalSessions}</span>
          </CardDescription>
        </CardHeader>

        <div className="space-y-3 my-3">
          <div className="p-3 rounded bg-[#0B0E17] border border-[#1E293B] grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Command Velocity</span>
              <span className="text-slate-200 font-semibold">{profile.behavioralDNA.commandVelocityPerMin} / min</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Bot Probability</span>
              <span className="text-rose-400 font-semibold">{Math.round(profile.behavioralDNA.botProbability * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Tool Signature</span>
              <span className="text-indigo-300 truncate block font-medium">{profile.behavioralDNA.toolSignature}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Estimated Zone</span>
              <span className="text-slate-300 font-semibold">{profile.behavioralDNA.timezoneEstimate}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <RiCompass3Line className="w-3.5 h-3.5 text-indigo-400" /> MITRE ATT&CK Matrix:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.mitreTechniques.map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-[#1E293B] text-[10px] font-mono text-indigo-300 border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Confidence: <strong className="text-emerald-400 font-semibold">{Math.round(profile.confidence * 100)}%</strong></span>
        <span className="flex items-center gap-1 text-rose-400 font-semibold">
          <RiAlarmWarningLine className="w-3.5 h-3.5" /> {profile.threatLevel} Severity
        </span>
      </div>
    </Card>
  );
};

