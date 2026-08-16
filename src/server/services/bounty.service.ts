import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { GhostBountyItem } from '@/shared/types';
import crypto from 'crypto';

export async function getAllGhostBounties(): Promise<GhostBountyItem[]> {
  const db = readDb();
  if (!db.ghostBounties) {
    db.ghostBounties = [];
    writeDb(db);
  }
  return db.ghostBounties;
}

export async function fundGhostBounty(data: {
  dnaFingerprint: string;
  title: string;
  description: string;
  rewardStrk: number;
  mitreTtps?: string[];
}): Promise<GhostBountyItem> {
  const db = readDb();
  if (!db.ghostBounties) db.ghostBounties = [];

  const txHash = `0x${crypto.randomBytes(16).toString('hex')}`;

  const newBounty: GhostBountyItem = {
    id: `gb-${Date.now().toString(36)}`,
    dnaFingerprint: data.dnaFingerprint || 'DNA-8A:99:C4',
    title: data.title,
    description: data.description,
    rewardStrk: data.rewardStrk,
    shieldedStatus: 'SHIELDED',
    confidenceScore: 95.0,
    matchedCampaignsCount: 1,
    mitreTtps: data.mitreTtps || ['T1059 (Command Scripting)', 'T1082 (System Discovery)'],
    createdAt: new Date().toISOString(),
    fundedTxHash: txHash,
  };

  db.ghostBounties.unshift(newBounty);
  writeDb(db);

  appendAuditBlock('GHOSTBOUNTY_FUNDED', {
    id: newBounty.id,
    dna: newBounty.dnaFingerprint,
    rewardStrk: newBounty.rewardStrk,
    txHash,
  });

  return newBounty;
}

export async function claimGhostBounty(bountyId: string, intelligenceReport: string): Promise<GhostBountyItem | null> {
  const db = readDb();
  if (!db.ghostBounties) return null;

  const bounty = db.ghostBounties.find((b) => b.id === bountyId);
  if (!bounty) return null;

  const claimantHash = `0x${crypto.createHash('sha256').update(intelligenceReport + Date.now().toString()).digest('hex').substring(0, 16)}`;

  bounty.shieldedStatus = 'CLAIMED';
  bounty.claimantHash = claimantHash;
  writeDb(db);

  appendAuditBlock('GHOSTBOUNTY_CLAIMED', {
    bountyId,
    claimantHash,
    intelligenceSnippet: intelligenceReport.substring(0, 50),
  });

  return bounty;
}
