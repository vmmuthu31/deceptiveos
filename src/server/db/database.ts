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
  honeypots: [],
  events: [],
  attackerProfiles: [],
  lures: [],
  beacons: [],
  lureContents: {},
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
