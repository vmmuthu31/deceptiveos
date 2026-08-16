export type HoneypotType = 'Cowrie' | 'Dionaea' | 'CustomLLM';
export type HoneypotStatus = 'active' | 'deploying' | 'stopped' | 'error';

export interface TwinSyncMetadata {
  hostname: string;
  osRelease: string;
  architecture: string;
  activePortRange: string;
  directoryNaming: string[];
  filePatterns: string[];
  lastSyncedAt: string;
  syncApproved: boolean;
}

export interface HoneypotProfile {
  id: string;
  name: string;
  type: HoneypotType;
  status: HoneypotStatus;
  port: number;
  ip: string;
  containerId: string;
  twinSyncEnabled: boolean;
  temporalJitterMs: number;
  activeSessionsCount: number;
  totalEventsCount: number;
  createdAt: string;
}

export type EventKind = 'auth_fail' | 'command_exec' | 'file_access' | 'malware_drop' | 'beacon_hit';

export interface CommandEvent {
  id: string;
  sessionId: string;
  honeypotId: string;
  timestamp: string;
  command: string;
  output: string;
  executionDelayMs: number;
  entropyScore: number;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  honeypotId: string;
  honeypotName: string;
  attackerIp: string;
  location: string;
  kind: EventKind;
  payload: string;
  timestamp: string;
  commands: CommandEvent[];
}

export type AttackerClass = 'ScriptKiddie' | 'HumanOperator' | 'AIAgent';

export interface AttackerProfile {
  id: string;
  ip: string;
  classification: AttackerClass;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  totalSessions: number;
  totalCommands: number;
  timingJitterAvgMs: number;
  mitreTechniques: string[];
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  behavioralDNA: {
    commandVelocityPerMin: number;
    typoFrequencyScore: number;
    toolSignature: string;
    timezoneEstimate: string;
    botProbability: number;
  };
}

export interface WatermarkToken {
  token: string;
  embeddedAt: string;
  stegoWhitespaceSignature: string;
  metadataTag: string;
}

export interface LureDocument {
  id: string;
  title: string;
  docType: 'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV';
  targetCompany: string;
  industry: string;
  watermark: WatermarkToken;
  beaconHitsCount: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface BeaconEvent {
  id: string;
  lureId: string;
  documentTitle: string;
  watermarkToken: string;
  sourceIp: string;
  location: string;
  userAgent: string;
  timestamp: string;
}

export interface ComplianceSummary {
  soc2Score: number;
  iso27001Score: number;
  gdprStatus: 'Compliant' | 'Review Needed';
  immutableAuditLogHeight: number;
  lastAuditExportAt: string;
}

export interface GhostBountyItem {
  id: string;
  dnaFingerprint: string;
  title: string;
  description: string;
  rewardStrk: number;
  shieldedStatus: 'SHIELDED' | 'UNSHIELDED' | 'CLAIMED';
  confidenceScore: number;
  matchedCampaignsCount: number;
  mitreTtps: string[];
  createdAt: string;
  fundedTxHash?: string;
  claimantHash?: string;
}

export interface TreasuryTx {
  id: string;
  type: 'SHIELD' | 'PRIVATE_TRANSFER' | 'UNSHIELD';
  amountStrk: number;
  txHash: string;
  utxoCommitment: string;
  status: 'CONFIRMED' | 'PENDING';
  timestamp: string;
  memo: string;
}

export interface PrivateTreasuryState {
  publicWalletAddress: string;
  publicBalanceStrk: number;
  shieldedBalanceStrk: number;
  committedBountyStrk: number;
  availableShieldedStrk: number;
  transactions: TreasuryTx[];
}

export interface AnonymizedThreatNode {
  id: string;
  anonymousDna: string;
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  toolSignature: string;
  mitreTechniques: string[];
  contributingDefendersCount: number;
  botProbability: number;
  firstSeenAt: string;
  lastActiveAt: string;
}

