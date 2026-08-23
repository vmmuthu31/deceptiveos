import { z } from 'zod';

export const CreateHoneypotSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(['Cowrie', 'Dionaea', 'CustomLLM']),
  port: z.number().int().min(1).max(65535),
  temporalJitterMs: z.number().int().min(0).max(5000).default(350),
  twinSyncEnabled: z.boolean().default(true),
});

export const GenerateLureSchema = z.object({
  title: z.string().min(3).max(100),
  docType: z.enum(['PDF', 'DOCX', 'XLSX', 'JSON', 'ENV']),
  targetCompany: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  customContext: z.string().optional(),
});

export const BeaconCallbackSchema = z.object({
  watermarkToken: z.string().min(8),
  sourceIp: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

const STRK_ADDRESS_RE = /^0x[0-9a-fA-F]+$/;

export const TreasuryTransactionSchema = z.object({
  type: z.enum(['SHIELD', 'PRIVATE_TRANSFER', 'UNSHIELD']),
  amountStrk: z.number().int().positive('Amount must be positive'),
  recipient: z.string().regex(STRK_ADDRESS_RE, 'Invalid Starknet address').optional(),
  memo: z.string().min(1).max(200),
});

export const FundBountySchema = z.object({
  dnaFingerprint: z.string().min(1).max(100),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  rewardStrk: z.number().int().positive('Reward must be positive'),
  mitreTtps: z.array(z.string()).optional(),
});

export const ClaimBountySchema = z.object({
  bountyId: z.string().min(1),
  intelligenceReport: z.string().min(20).max(10000),
  researcherAddress: z.string().regex(STRK_ADDRESS_RE, 'Invalid Starknet address'),
});

export const SessionEventSchema = z.object({
  sessionId: z.string().min(1),
  honeypotId: z.string().min(1),
  honeypotName: z.string().min(1),
  attackerIp: z.string().ip(),
  location: z.string().min(1),
  kind: z.enum(['auth_fail', 'command_exec', 'file_access', 'malware_drop', 'beacon_hit']),
  payload: z.string(),
  commands: z.array(z.object({
    id: z.string(),
    sessionId: z.string(),
    honeypotId: z.string(),
    timestamp: z.string(),
    command: z.string(),
    output: z.string(),
    executionDelayMs: z.number(),
    entropyScore: z.number(),
  })).default([]),
});
