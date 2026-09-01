import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { ContainmentAction, ContainmentType } from '@/shared/types';

export async function getAllContainmentActions(): Promise<ContainmentAction[]> {
  const db = readDb();
  return db.containmentActions || [];
}

export async function executeContainmentAction(data: {
  type: ContainmentType;
  targetId: string;
  targetName: string;
  executedBy?: string;
  reason?: string;
}): Promise<ContainmentAction> {
  const db = readDb();
  if (!db.containmentActions) db.containmentActions = [];

  const executedBy = data.executedBy || 'SOC Operator (CipherNest Desktop)';
  const details = data.reason || `Automated containment rule executed for target: ${data.targetName}`;

  if (data.type === 'BLOCK_IP') {
    const profile = db.attackerProfiles?.find((p) => p.ip === data.targetId || p.id === data.targetId);
    if (profile) {
      profile.threatLevel = 'Critical';
    }
  } else if (data.type === 'RESTRICT_MCP_TOOL') {
    const tool = db.mcpDecoys?.find((t) => t.id === data.targetId || t.name === data.targetId);
    if (tool) {
      tool.enabled = false;
    }
  } else if (data.type === 'ISOLATE_DECOY') {
    const hp = db.honeypots?.find((h) => h.id === data.targetId);
    if (hp) {
      hp.status = 'stopped';
    }
  }

  const auditBlock = appendAuditBlock(`CONTAINMENT_${data.type}`, {
    targetId: data.targetId,
    targetName: data.targetName,
    executedBy,
    details,
  });

  const newAction: ContainmentAction = {
    id: `act-${Date.now().toString(36)}`,
    type: data.type,
    targetId: data.targetId,
    targetName: data.targetName,
    status: 'EXECUTED',
    executedBy,
    timestamp: new Date().toISOString(),
    auditBlockHash: auditBlock.blockHash,
    details,
  };

  db.containmentActions.unshift(newAction);
  writeDb(db);

  return newAction;
}
