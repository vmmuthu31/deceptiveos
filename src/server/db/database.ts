import { AttackerProfile, BeaconEvent, HoneypotProfile, LureDocument, SessionEvent } from '@/shared/types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface AuditBlock {
  blockIndex: number;
  timestamp: string;
  action: string;
  payloadHash: string;
  previousHash: string;
  blockHash: string;
}

interface DatabaseSchema {
  honeypots: HoneypotProfile[];
  events: SessionEvent[];
  attackerProfiles: AttackerProfile[];
  lures: LureDocument[];
  beacons: BeaconEvent[];
  lureContents: Record<string, string>;
  auditLedger: AuditBlock[];
  ghostBounties?: import('@/shared/types').GhostBountyItem[];
  treasury?: import('@/shared/types').PrivateTreasuryState;
  threatNetwork?: import('@/shared/types').AnonymizedThreatNode[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'ciphernest-store.json');

const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function calculateBlockHash(
  blockIndex: number,
  timestamp: string,
  action: string,
  payloadHash: string,
  previousHash: string
): string {
  const content = `${blockIndex}:${timestamp}:${action}:${payloadHash}:${previousHash}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

const initialTimestamp = new Date(Date.now() - 86400000 * 5).toISOString();
const genesisPayloadHash = crypto.createHash('sha256').update('GENESIS_BLOCK_CIPHERNEST_INIT').digest('hex');
const genesisBlockHash = calculateBlockHash(0, initialTimestamp, 'GENESIS_INITIALIZATION', genesisPayloadHash, GENESIS_PREV_HASH);

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
  auditLedger: [
    {
      blockIndex: 0,
      timestamp: initialTimestamp,
      action: 'GENESIS_INITIALIZATION',
      payloadHash: genesisPayloadHash,
      previousHash: GENESIS_PREV_HASH,
      blockHash: genesisBlockHash,
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
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.auditLedger || parsed.auditLedger.length === 0) {
      parsed.auditLedger = INITIAL_SEED.auditLedger;
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
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

export function appendAuditBlock(action: string, payload: unknown): AuditBlock {
  const db = readDb();
  const lastBlock = db.auditLedger[db.auditLedger.length - 1] || INITIAL_SEED.auditLedger[0];
  const blockIndex = lastBlock.blockIndex + 1;
  const timestamp = new Date().toISOString();
  const previousHash = lastBlock.blockHash;
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

  const blockHash = calculateBlockHash(blockIndex, timestamp, action, payloadHash, previousHash);

  const newBlock: AuditBlock = {
    blockIndex,
    timestamp,
    action,
    payloadHash,
    previousHash,
    blockHash,
  };

  db.auditLedger.push(newBlock);
  writeDb(db);

  return newBlock;
}

export function verifyAuditChain(): { verified: boolean; blockCount: number; rootHash: string; invalidBlockIndex?: number } {
  const db = readDb();
  const ledger = db.auditLedger;

  if (!ledger || ledger.length === 0) {
    return { verified: false, blockCount: 0, rootHash: 'none' };
  }

  for (let i = 0; i < ledger.length; i++) {
    const block = ledger[i];
    const expectedPrevHash = i === 0 ? GENESIS_PREV_HASH : ledger[i - 1].blockHash;

    if (block.previousHash !== expectedPrevHash) {
      return { verified: false, blockCount: ledger.length, rootHash: ledger[ledger.length - 1].blockHash, invalidBlockIndex: i };
    }

    const calculated = calculateBlockHash(block.blockIndex, block.timestamp, block.action, block.payloadHash, block.previousHash);

    if (calculated !== block.blockHash) {
      return { verified: false, blockCount: ledger.length, rootHash: ledger[ledger.length - 1].blockHash, invalidBlockIndex: i };
    }
  }

  return { verified: true, blockCount: ledger.length, rootHash: ledger[ledger.length - 1].blockHash };
}
