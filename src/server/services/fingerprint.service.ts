import { readDb, writeDb } from '@/server/db/database';
import { AttackerProfile, SessionEvent } from '@/shared/types';
import { calculateShannonEntropy } from '@/shared/utils/formatters';

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

  // Compute Shannon entropy scores dynamically for commands
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

  // Update or create Attacker DNA profile dynamically
  let profile = db.attackerProfiles.find((p) => p.ip === eventData.attackerIp);
  if (!profile) {
    profile = {
      id: `atk-profile-${Date.now().toString(36)}`,
      ip: eventData.attackerIp,
      classification: eventData.commands.length > 5 ? 'AIAgent' : 'ScriptKiddie',
      confidence: 0.85,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      totalSessions: 1,
      totalCommands: eventData.commands.length,
      timingJitterAvgMs: 250,
      mitreTechniques: ['T1059 (Command Interpreter)', 'T1082 (System Info Discovery)'],
      threatLevel: 'High',
      behavioralDNA: {
        commandVelocityPerMin: Number((eventData.commands.length * 6).toFixed(1)),
        typoFrequencyScore: 0.05,
        toolSignature: 'Interactive SSH / Automated Command Stream',
        timezoneEstimate: 'UTC+00:00',
        botProbability: eventData.commands.length > 5 ? 0.92 : 0.45,
      },
    };
    db.attackerProfiles.unshift(profile);
  } else {
    profile.lastSeenAt = new Date().toISOString();
    profile.totalSessions += 1;
    profile.totalCommands += eventData.commands.length;
  }

  writeDb(db);
  return newEvt;
}
