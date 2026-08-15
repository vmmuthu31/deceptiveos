import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { AttackerClass, AttackerProfile, SessionEvent } from '@/shared/types';
import { calculateShannonEntropy } from '@/shared/utils/formatters';

const BASH_DICTIONARY = [
  'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'chmod', 'chown', 'systemctl', 'service',
  'docker', 'sudo', 'curl', 'wget', 'ssh', 'scp', 'tar', 'unzip', 'python', 'bash',
];

function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateTypoRatio(commands: string[]): number {
  if (commands.length === 0) return 0;

  let totalTypoDistance = 0;
  for (const cmd of commands) {
    const firstWord = cmd.trim().split(' ')[0].toLowerCase();
    let minDistance = Number.MAX_SAFE_INTEGER;
    for (const valid of BASH_DICTIONARY) {
      const dist = calculateLevenshteinDistance(firstWord, valid);
      if (dist < minDistance) minDistance = dist;
    }
    if (minDistance > 0 && minDistance <= 2) {
      totalTypoDistance += 1;
    }
  }
  return Number((totalTypoDistance / commands.length).toFixed(2));
}

function matchMitreTechniquesAndAttribution(commands: string[]): { techniques: string[]; classification: AttackerClass; confidence: number } {
  const combined = commands.join('; ').toLowerCase();
  const techniques: string[] = [];

  if (combined.includes('cat /etc') || combined.includes('shadow') || combined.includes('passwd')) {
    techniques.push('T1005 (Data from Local System)', 'T1087.001 (Local Account Discovery)');
  }

  if (combined.includes('uname') || combined.includes('lscpu') || combined.includes('hostname')) {
    techniques.push('T1082 (System Information Discovery)');
  }

  if (combined.includes('curl') || combined.includes('wget')) {
    techniques.push('T1105 (Ingress Tool Transfer)');
  }

  if (combined.includes('chmod +x') || combined.includes('sudo') || combined.includes('su root')) {
    techniques.push('T1068 (Exploitation for Privilege Escalation)');
  }

  if (combined.includes('nmap') || combined.includes('sqlmap') || combined.includes('hydra')) {
    techniques.push('T1595 (Active Scanning)');
  }

  if (techniques.length === 0) {
    techniques.push('T1059.004 (Unix Shell Command Execution)');
  }

  // Classification heuristic
  if (combined.includes('python') || combined.includes('import') || commands.some((c) => c.length > 120)) {
    return { techniques, classification: 'AIAgent', confidence: 0.95 };
  }

  if (combined.includes('nmap') || combined.includes('sqlmap') || commands.length <= 2) {
    return { techniques, classification: 'ScriptKiddie', confidence: 0.88 };
  }

  return { techniques, classification: 'HumanOperator', confidence: 0.82 };
}

export async function getAllEvents(): Promise<SessionEvent[]> {
  const db = readDb();
  return db.events;
}

export async function getAllAttackerProfiles(): Promise<AttackerProfile[]> {
  const db = readDb();
  return db.attackerProfiles;
}

export async function addSessionEvent(eventData: Omit<SessionEvent, 'id' | 'timestamp'>): Promise<SessionEvent> {
  const db = readDb();

  const processedCommands = eventData.commands.map((cmd) => ({
    ...cmd,
    entropyScore: calculateShannonEntropy(cmd.command),
  }));

  const newEvt: SessionEvent = {
    ...eventData,
    commands: processedCommands,
    id: `evt-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  };

  db.events.unshift(newEvt);

  const rawCmdList = eventData.commands.map((c) => c.command);
  const typoRatio = calculateTypoRatio(rawCmdList);
  const { techniques, classification, confidence } = matchMitreTechniquesAndAttribution(rawCmdList);

  let profile = db.attackerProfiles.find((p) => p.ip === eventData.attackerIp);

  if (!profile) {
    profile = {
      id: `atk-profile-${Date.now().toString(36)}`,
      ip: eventData.attackerIp,
      classification,
      confidence,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      totalSessions: 1,
      totalCommands: eventData.commands.length,
      timingJitterAvgMs: classification === 'AIAgent' ? 110 : 1850,
      mitreTechniques: techniques,
      threatLevel: classification === 'AIAgent' ? 'Critical' : 'High',
      behavioralDNA: {
        commandVelocityPerMin: Number((eventData.commands.length * 6).toFixed(1)),
        typoFrequencyScore: typoRatio,
        toolSignature: classification === 'AIAgent' ? 'Autonomous AI Red Team Agent' : 'Interactive Shell Operator',
        timezoneEstimate: 'UTC+02:00',
        botProbability: classification === 'AIAgent' ? 0.98 : 0.25,
      },
    };
    db.attackerProfiles.unshift(profile);
  } else {
    profile.lastSeenAt = new Date().toISOString();
    profile.totalSessions += 1;
    profile.totalCommands += eventData.commands.length;
    profile.mitreTechniques = Array.from(new Set([...profile.mitreTechniques, ...techniques]));
  }

  writeDb(db);

  appendAuditBlock('SESSION_EVENT_RECORDED', { sessionId: newEvt.sessionId, ip: newEvt.attackerIp, kind: newEvt.kind });

  return newEvt;
}
