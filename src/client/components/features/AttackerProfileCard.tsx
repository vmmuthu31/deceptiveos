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
    <Card className="flex flex-col justify-between font-sans h-full hover:shadow-md transition-all">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <RiFingerprintLine className="w-4 h-4" />
              </div>
              <CardTitle className="font-mono text-base text-slate-900 font-bold">{profile.ip}</CardTitle>
            </div>
            {getClassificationBadge()}
          </div>
          <CardDescription>
            First seen: <span className="font-mono text-slate-700 font-semibold">{new Date(profile.firstSeenAt).toLocaleDateString()}</span> | Sessions: <span className="font-mono text-slate-900 font-bold">{profile.totalSessions}</span>
          </CardDescription>
        </CardHeader>

        <div className="space-y-3 my-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Command Velocity</span>
              <span className="text-slate-800 font-bold">{profile.behavioralDNA.commandVelocityPerMin} / min</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Bot Probability</span>
              <span className="text-rose-600 font-bold">{Math.round(profile.behavioralDNA.botProbability * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Tool Signature</span>
              <span className="text-indigo-600 truncate block font-bold">{profile.behavioralDNA.toolSignature}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Estimated Zone</span>
              <span className="text-slate-800 font-bold">{profile.behavioralDNA.timezoneEstimate}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <RiCompass3Line className="w-4 h-4 text-indigo-600" /> MITRE ATT&CK Matrix:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {profile.mitreTechniques.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200 font-semibold">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 font-medium">Confidence: <strong className="text-emerald-600 font-bold">{Math.round(profile.confidence * 100)}%</strong></span>
        <span className="flex items-center gap-1 text-rose-600 font-bold uppercase tracking-wider text-[11px]">
          <RiAlarmWarningLine className="w-3.5 h-3.5" /> {profile.threatLevel} Severity
        </span>
      </div>
    </Card>
  );
};


