import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { GhostBountyItem } from '@/shared/types';

export async function getAllGhostBounties(): Promise<GhostBountyItem[]> {
  const db = readDb();
  if (!db.ghostBounties) {
    db.ghostBounties = [
      {
        id: 'gb-01',
        dnaFingerprint: '7F-A2-91',
        title: 'Automated SSH Credential Harvester Campaign',
        description: 'Identify matching command signatures and C2 server IPs for autonomous SSH brute-force botnet.',
        rewardStrk: 100,
        shieldedStatus: 'SHIELDED',
        confidenceScore: 94.7,
        matchedCampaignsCount: 3,
        mitreTtps: ['T1059 (Command and Scripting)', 'T1083 (File Discovery)', 'T1552 (Unsecured Credentials)'],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        fundedTxHash: '0x05a91e84c910293f8e12481029b471',
      },
      {
        id: 'gb-02',
        dnaFingerprint: '8A:42:F1:9C',
        title: 'Stealthy Reconnaissance & AWS Token Search',
        description: 'Unmask actor infrastructure associated with environment token enumeration and AWS credential probes.',
        rewardStrk: 250,
        shieldedStatus: 'SHIELDED',
        confidenceScore: 91.0,
        matchedCampaignsCount: 5,
        mitreTtps: ['T1082 (System Information Discovery)', 'T1087 (Account Discovery)'],
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        fundedTxHash: '0x07f18c9b20149a8d29f012847120a1',
      },
    ];
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

  const txHash = `0x${Math.random().toString(16).substring(2, 34)}`;

  const newBounty: GhostBountyItem = {
    id: `gb-${Date.now().toString(36)}`,
    dnaFingerprint: data.dnaFingerprint || 'DNA-8A:99:C4',
    title: data.title,
    description: data.description,
    rewardStrk: data.rewardStrk,
    shieldedStatus: 'SHIELDED',
    confidenceScore: 92.5,
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

  bounty.shieldedStatus = 'CLAIMED';
  bounty.claimantHash = `0x_anon_researcher_${Math.random().toString(36).substring(2, 10)}`;
  writeDb(db);

  appendAuditBlock('GHOSTBOUNTY_CLAIMED', {
    bountyId,
    claimantHash: bounty.claimantHash,
    intelligenceSnippet: intelligenceReport.substring(0, 50),
  });

  return bounty;
}
