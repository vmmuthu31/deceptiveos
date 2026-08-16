import { readDb } from '@/server/db/database';
import { AnonymizedThreatNode } from '@/shared/types';
import crypto from 'crypto';

export async function getAnonymizedThreatGraph(): Promise<AnonymizedThreatNode[]> {
  const db = readDb();
  const profiles = db.attackerProfiles || [];

  return profiles.map((p) => {
    const dnaHash = crypto.createHash('sha256').update(p.ip).digest('hex').substring(0, 8).toUpperCase();
    return {
      id: `node-${p.id}`,
      anonymousDna: `DNA: ${dnaHash}`,
      threatLevel: p.threatLevel,
      toolSignature: p.behavioralDNA.toolSignature,
      mitreTechniques: p.mitreTechniques,
      contributingDefendersCount: Math.max(1, p.totalSessions),
      botProbability: p.behavioralDNA.botProbability,
      firstSeenAt: p.firstSeenAt,
      lastActiveAt: p.lastSeenAt,
    };
  });
}
