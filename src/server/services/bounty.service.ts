import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { GhostBountyItem } from '@/shared/types';
import { privateTransfer } from '@/server/services/starknet/transfer';
import { getPrivateTreasuryState } from './treasury.service';

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
  const treasury = await getPrivateTreasuryState();

  if (data.rewardStrk > treasury.availableShieldedStrk) {
    throw new Error(
      `Insufficient shielded balance: need ${data.rewardStrk} STRK, have ${treasury.availableShieldedStrk} STRK`,
    );
  }

  const result = await privateTransfer(
    treasury.publicWalletAddress,
    BigInt(data.rewardStrk),
  );

  const db = readDb();
  if (!db.ghostBounties) db.ghostBounties = [];

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
    fundedTxHash: result.txHash,
  };

  db.ghostBounties.unshift(newBounty);

  treasury.committedBountyStrk += data.rewardStrk;
  treasury.availableShieldedStrk -= data.rewardStrk;
  writeDb(db);

  appendAuditBlock('GHOSTBOUNTY_FUNDED', {
    id: newBounty.id,
    dna: newBounty.dnaFingerprint,
    rewardStrk: newBounty.rewardStrk,
    txHash: result.txHash,
  });

  return newBounty;
}

export async function claimGhostBounty(
  bountyId: string,
  intelligenceReport: string,
  researcherAddress: string,
): Promise<GhostBountyItem | null> {
  if (!researcherAddress.match(/^0x[0-9a-fA-F]+$/)) {
    throw new Error('Invalid researcher address');
  }

  const db = readDb();
  if (!db.ghostBounties) return null;

  const bounty = db.ghostBounties.find((b) => b.id === bountyId);
  if (!bounty) return null;

  if (bounty.shieldedStatus !== 'SHIELDED') {
    throw new Error(`Bounty ${bountyId} is not in SHIELDED status`);
  }

  const result = await privateTransfer(researcherAddress, BigInt(bounty.rewardStrk));

  const treasury = await getPrivateTreasuryState();
  treasury.committedBountyStrk -= bounty.rewardStrk;

  bounty.shieldedStatus = 'CLAIMED';
  bounty.claimantHash = result.txHash;
  writeDb(db);

  appendAuditBlock('GHOSTBOUNTY_CLAIMED', {
    bountyId,
    researcherAddress,
    rewardStrk: bounty.rewardStrk,
    txHash: result.txHash,
    intelligenceSnippet: intelligenceReport.substring(0, 50),
  });

  return bounty;
}
