import { readDb } from '@/server/db/database';
import { AttackCampaign, AttackGraphLink, AttackGraphNode } from '@/shared/types';

export async function getCorrelatedAttackCampaigns(): Promise<AttackCampaign[]> {
  const db = readDb();
  const profiles = db.attackerProfiles || [];
  const honeypots = db.honeypots || [];
  const lures = db.lures || [];
  const mcpDecoys = db.mcpDecoys || [];
  const mcpInvocations = db.mcpInvocations || [];
  const beacons = db.beacons || [];

  if (profiles.length === 0) {
    return [];
  }

  const campaigns: AttackCampaign[] = profiles.map((profile) => {
    const nodes: AttackGraphNode[] = [];
    const links: AttackGraphLink[] = [];
    const stagesCompleted: string[] = ['Reconnaissance'];

    nodes.push({
      id: `node-${profile.id}`,
      label: `Attacker [${profile.ip}]`,
      type: 'ATTACKER',
      isDeceptive: false,
      threatLevel: profile.threatLevel,
      details: `${profile.classification} (${(profile.confidence * 100).toFixed(0)}% conf) | ${profile.behavioralDNA.toolSignature}`,
    });

    honeypots.forEach((hp) => {
      nodes.push({
        id: `node-${hp.id}`,
        label: hp.name,
        type: 'DECOY_HONEYPOT',
        isDeceptive: true,
        details: `Decoy Container on Port ${hp.port} (Jitter: ${hp.temporalJitterMs}ms)`,
      });

      links.push({
        source: `node-${profile.id}`,
        target: `node-${hp.id}`,
        action: 'SSH Brute-Force & Recon',
        stage: 'Initial Access',
        timestamp: profile.firstSeenAt,
      });
      stagesCompleted.push('Initial Access');
    });

    mcpDecoys.slice(0, 2).forEach((mcp) => {
      nodes.push({
        id: `node-${mcp.id}`,
        label: `MCP Decoy: ${mcp.name}`,
        type: 'MCP_DECOY',
        isDeceptive: true,
        details: `Canary Token: ${mcp.canaryToken}`,
      });

      links.push({
        source: `node-${profile.id}`,
        target: `node-${mcp.id}`,
        action: 'Prompt Injection Tool Execution',
        stage: 'Tool Abuse',
        timestamp: mcp.lastTriggeredAt || profile.lastSeenAt,
      });
      stagesCompleted.push('Tool Abuse');
    });

    lures.slice(0, 2).forEach((lure) => {
      nodes.push({
        id: `node-${lure.id}`,
        label: `Lure: ${lure.title}`,
        type: 'HONEYTOKEN',
        isDeceptive: true,
        details: `Steganographic Canary (${lure.watermark.metadataTag})`,
      });

      links.push({
        source: `node-${profile.id}`,
        target: `node-${lure.id}`,
        action: 'Honeytoken Download & Exfiltration',
        stage: 'Exfiltration',
        timestamp: lure.createdAt,
      });
      stagesCompleted.push('Exfiltration');
    });

    nodes.push({
      id: 'node-real-core-db',
      label: 'Core Production Customer DB',
      type: 'DATABASE',
      isDeceptive: false,
      threatLevel: 'Critical',
      details: 'Protected High-Value Asset (Unbreached - Diverted to Decoys)',
    });

    let overallRiskScore = 65;
    if (profile.threatLevel === 'Critical') overallRiskScore = 96;
    if (profile.threatLevel === 'High') overallRiskScore = 84;
    if (mcpInvocations.length > 0) overallRiskScore = Math.min(99, overallRiskScore + 3);
    if (beacons.length > 0) overallRiskScore = Math.min(100, overallRiskScore + 2);

    return {
      id: `camp-${profile.id}`,
      attackerIp: profile.ip,
      attackerDna: `DNA-${profile.id.substring(profile.id.length - 8).toUpperCase()}`,
      classification: profile.classification,
      overallRiskScore,
      stagesCompleted: Array.from(new Set(stagesCompleted)),
      nodes,
      links,
      status: profile.threatLevel === 'Critical' ? 'ACTIVE' : 'MONITORING',
      firstSeenAt: profile.firstSeenAt,
      lastActivityAt: profile.lastSeenAt,
    };
  });

  return campaigns;
}
