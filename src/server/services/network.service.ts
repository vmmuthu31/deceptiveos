import { readDb } from '@/server/db/database';
import { AnonymizedThreatNode } from '@/shared/types';

export async function getAnonymizedThreatGraph(): Promise<AnonymizedThreatNode[]> {
  const db = readDb();
  if (!db.threatNetwork) {
    db.threatNetwork = [
      {
        id: 'node-01',
        anonymousDna: 'DNA: 7F-A2-91',
        threatLevel: 'Critical',
        toolSignature: 'Nmap 7.94 / Custom SSH Botnet Scanner',
        mitreTechniques: ['T1059 (Scripting)', 'T1083 (File Search)', 'T1552 (Credential Dump)'],
        contributingDefendersCount: 14,
        botProbability: 0.98,
        firstSeenAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
      {
        id: 'node-02',
        anonymousDna: 'DNA: 8A:42:F1:9C',
        threatLevel: 'High',
        toolSignature: 'Masscan / Metasploit Framework',
        mitreTechniques: ['T1082 (System Info Discovery)', 'T1087 (Local Account Discovery)'],
        contributingDefendersCount: 9,
        botProbability: 0.85,
        firstSeenAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastActiveAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'node-03',
        anonymousDna: 'DNA: 3C:11:09:A4',
        threatLevel: 'Medium',
        toolSignature: 'Hydra SSH Password Brute Forcer',
        mitreTechniques: ['T1110 (Brute Force)', 'T1046 (Network Service Discovery)'],
        contributingDefendersCount: 22,
        botProbability: 0.99,
        firstSeenAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lastActiveAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];
  }
  return db.threatNetwork;
}
